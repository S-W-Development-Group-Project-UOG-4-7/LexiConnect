from __future__ import annotations

import csv
import io
import json
from datetime import datetime, timedelta, timezone
from typing import Iterable, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.kyc_submission import KYCSubmission
from app.models.user import User, UserRole
from app.modules.audit_log.models import AuditLog
from app.modules.audit_log.service import log_event
from app.modules.auth_log.models import AuthLog
from app.modules.disputes.models import Dispute
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/admin/reports", tags=["Admin Reports"])


def _require_admin(user: User):
    role = getattr(user, "role", None)
    if role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin only")


def _date_range(days: int) -> list[datetime]:
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=days - 1)
    return [
        datetime.combine(start + timedelta(days=i), datetime.min.time(), tzinfo=timezone.utc)
        for i in range(days)
    ]


def _stream_csv(rows: Iterable[list[str]], filename: str):
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    for row in rows:
        writer.writerow(row)
    buffer.seek(0)
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers=headers,
    )


@router.get("/weekly-activity.csv")
def weekly_activity_report(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)
    days = max(1, min(90, days))

    start_dates = _date_range(days)
    start = start_dates[0]
    end = start_dates[-1] + timedelta(days=1)

    try:
        auth_rows = (
            db.query(
                func.date(AuthLog.occurred_at).label("day"),
                func.sum(case((AuthLog.success.is_(True), 1), else_=0)).label("success"),
                func.sum(case((AuthLog.success.is_(False), 1), else_=0)).label("fail"),
            )
            .filter(
                AuthLog.event_type == "LOGIN",
                AuthLog.occurred_at >= start,
                AuthLog.occurred_at < end,
            )
            .group_by("day")
            .all()
        )
        audit_rows = (
            db.query(func.date(AuditLog.created_at).label("day"), func.count().label("count"))
            .filter(AuditLog.created_at >= start, AuditLog.created_at < end)
            .group_by("day")
            .all()
        )
        booking_created_rows = (
            db.query(func.date(Booking.created_at).label("day"), func.count().label("count"))
            .filter(Booking.created_at >= start, Booking.created_at < end)
            .group_by("day")
            .all()
        )
        booking_confirmed_rows = (
            db.query(func.date(Booking.created_at).label("day"), func.count().label("count"))
            .filter(
                Booking.created_at >= start,
                Booking.created_at < end,
                func.upper(Booking.status) == "CONFIRMED",
            )
            .group_by("day")
            .all()
        )
        booking_rejected_rows = (
            db.query(func.date(Booking.created_at).label("day"), func.count().label("count"))
            .filter(
                Booking.created_at >= start,
                Booking.created_at < end,
                func.upper(Booking.status) == "REJECTED",
            )
            .group_by("day")
            .all()
        )
        dispute_rows = (
            db.query(func.date(Dispute.created_at).label("day"), func.count().label("count"))
            .filter(Dispute.created_at >= start, Dispute.created_at < end)
            .group_by("day")
            .all()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to build weekly activity report: {exc}") from exc

    auth_map = {r.day: {"success": int(r.success or 0), "fail": int(r.fail or 0)} for r in auth_rows}
    audit_map = {r.day: int(r.count or 0) for r in audit_rows}
    booking_created_map = {r.day: int(r.count or 0) for r in booking_created_rows}
    booking_confirmed_map = {r.day: int(r.count or 0) for r in booking_confirmed_rows}
    booking_rejected_map = {r.day: int(r.count or 0) for r in booking_rejected_rows}
    dispute_map = {r.day: int(r.count or 0) for r in dispute_rows}

    rows = [
        [
            "date",
            "auth_success_count",
            "auth_fail_count",
            "audit_events_count",
            "bookings_created_count",
            "bookings_confirmed_count",
            "bookings_rejected_count",
            "disputes_opened_count",
        ]
    ]
    for day_dt in start_dates:
        day = day_dt.date()
        auth_counts = auth_map.get(day, {"success": 0, "fail": 0})
        rows.append(
            [
                day.isoformat(),
                str(auth_counts["success"]),
                str(auth_counts["fail"]),
                str(audit_map.get(day, 0)),
                str(booking_created_map.get(day, 0)),
                str(booking_confirmed_map.get(day, 0)),
                str(booking_rejected_map.get(day, 0)),
                str(dispute_map.get(day, 0)),
            ]
        )

    log_event(
        db,
        actor=current_user,
        actor_role=str(getattr(current_user, "role", "") or ""),
        action="REPORT_EXPORTED",
        description="Weekly system activity report exported",
        meta={"report_type": "weekly_activity", "days": days},
        success=True,
        commit=True,
    )

    filename = f"lexiconnect_weekly_activity_{datetime.now(timezone.utc).date().isoformat()}.csv"
    return _stream_csv(rows, filename)


@router.get("/kyc-summary.csv")
def kyc_summary_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)
    try:
        rows = (
            db.query(KYCSubmission.status, func.count().label("count"))
            .group_by(KYCSubmission.status)
            .all()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to build KYC summary report: {exc}") from exc

    csv_rows = [["status", "count"]]
    for row in rows:
        csv_rows.append([str(row.status or "unknown"), str(int(row.count or 0))])

    log_event(
        db,
        actor=current_user,
        actor_role=str(getattr(current_user, "role", "") or ""),
        action="REPORT_EXPORTED",
        description="KYC summary report exported",
        meta={"report_type": "kyc_summary"},
        success=True,
        commit=True,
    )

    filename = f"lexiconnect_kyc_summary_{datetime.now(timezone.utc).date().isoformat()}.csv"
    return _stream_csv(csv_rows, filename)


@router.get("/booking-summary.csv")
def booking_summary_report(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)
    days = max(1, min(365, days))
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    try:
        total = (
            db.query(func.count(Booking.id))
            .filter(Booking.created_at >= cutoff)
            .scalar()
            or 0
        )
        status_rows = (
            db.query(func.upper(Booking.status).label("status"), func.count().label("count"))
            .filter(Booking.created_at >= cutoff)
            .group_by("status")
            .all()
        )
        branch_rows = (
            db.query(Booking.branch_id, func.count().label("count"))
            .filter(Booking.created_at >= cutoff, Booking.branch_id.isnot(None))
            .group_by(Booking.branch_id)
            .order_by(func.count().desc())
            .limit(5)
            .all()
        )
        lawyer_rows = (
            db.query(Booking.lawyer_id, func.count().label("count"))
            .filter(Booking.created_at >= cutoff, Booking.lawyer_id.isnot(None))
            .group_by(Booking.lawyer_id)
            .order_by(func.count().desc())
            .limit(5)
            .all()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to build booking summary report: {exc}") from exc

    status_map = {r.status or "UNKNOWN": int(r.count or 0) for r in status_rows}
    avg_per_day = round((total / days), 2) if days else 0

    top_branches = [
        {"branch_id": r.branch_id, "count": int(r.count or 0)} for r in branch_rows
    ]
    top_lawyers = [
        {"lawyer_id": r.lawyer_id, "count": int(r.count or 0)} for r in lawyer_rows
    ]

    csv_rows = [
        [
            "total_bookings",
            "pending",
            "confirmed",
            "rejected",
            "cancelled",
            "avg_bookings_per_day",
            "top_branches",
            "top_lawyers",
        ]
    ]
    csv_rows.append(
        [
            str(total),
            str(status_map.get("PENDING", 0)),
            str(status_map.get("CONFIRMED", 0)),
            str(status_map.get("REJECTED", 0)),
            str(status_map.get("CANCELLED", 0)),
            str(avg_per_day),
            json.dumps(top_branches),
            json.dumps(top_lawyers),
        ]
    )

    log_event(
        db,
        actor=current_user,
        actor_role=str(getattr(current_user, "role", "") or ""),
        action="REPORT_EXPORTED",
        description="Booking summary report exported",
        meta={"report_type": "booking_summary", "days": days},
        success=True,
        commit=True,
    )

    filename = f"lexiconnect_booking_summary_{datetime.now(timezone.utc).date().isoformat()}.csv"
    return _stream_csv(csv_rows, filename)


@router.get("/audit-trail.json")
def audit_trail_export(
    days: int = Query(30, ge=1, le=365),
    page: int = Query(1, ge=1),
    page_size: int = Query(500, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)
    days = max(1, min(365, days))
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    try:
        rows = (
            db.query(AuditLog)
            .filter(AuditLog.created_at >= cutoff)
            .order_by(AuditLog.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to export audit trail: {exc}") from exc

    items = []
    for l in rows:
        items.append(
            {
                "id": l.id,
                "user_id": l.user_id,
                "user_email": l.user_email,
                "action": l.action,
                "description": l.description,
                "meta": l.meta,
                "created_at": l.created_at,
            }
        )

    log_event(
        db,
        actor=current_user,
        actor_role=str(getattr(current_user, "role", "") or ""),
        action="REPORT_EXPORTED",
        description="Audit trail exported",
        meta={"report_type": "audit_trail", "days": days},
        success=True,
        commit=True,
    )

    filename = f"lexiconnect_audit_trail_{datetime.now(timezone.utc).date().isoformat()}.json"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return JSONResponse(content=items, headers=headers)
