from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview")
def admin_overview_dummy():
    """Return simple dummy stats for admin dashboard."""
    return {
        "total_users": 25,
        "total_lawyers": 8,
        "total_bookings": 42,
        "pending_kyc": 3,
    }
