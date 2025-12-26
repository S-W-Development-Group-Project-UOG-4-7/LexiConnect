from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import date, datetime, time

from ..database import get_db
from ..models.lawyer_availability import WeeklyAvailability, BlackoutDate, WeekDay
from ..models.availability_template_simple import AvailabilityTemplate
from ..models.lawyer import Lawyer
from ..models.branch import Branch
from ..schemas.lawyer_availability import (
    WeeklyAvailabilityCreate, WeeklyAvailabilityUpdate, WeeklyAvailabilityResponse,
    BlackoutDateCreate, BlackoutDateUpdate, BlackoutDateResponse,
    LawyerAvailabilityResponse, BulkWeeklyAvailabilityCreate, BulkBlackoutDateCreate,
    AvailabilityStatus, BranchInfo
)

router = APIRouter(prefix="/api/lawyer-availability", tags=["Lawyer Availability"])


# Helper functions for availability_templates
def day_to_int(day_str: str) -> int:
    days = {"monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6}
    return days.get(day_str.lower(), 0)

def format_time_to_string(time_obj: time) -> str:
    """Convert time object to HH:MM AM/PM string"""
    hours = time_obj.hour
    minutes = time_obj.minute
    period = "AM" if hours < 12 else "PM"
    hours_12 = hours % 12
    if hours_12 == 0:
        hours_12 = 12
    return f"{hours_12}:{minutes:02d} {period}"


# Helper functions
def parse_time_string(time_str: str) -> time:
    """Convert HH:MM AM/PM string to time object"""
    try:
        time_part = time_str.split()[0]
        period = time_str.split()[1]
        hours, minutes = map(int, time_part.split(':'))
        
        if period.upper() == 'PM' and hours != 12:
            hours += 12
        elif period.upper() == 'AM' and hours == 12:
            hours = 0
            
        return time(hour=hours, minute=minutes)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time format. Use HH:MM AM/PM"
        )


def time_to_minutes(t: time) -> int:
    """Convert time object to minutes since midnight"""
    return t.hour * 60 + t.minute


def format_time_to_string(t: time) -> str:
    """Convert time object to HH:MM AM/PM string"""
    hour = t.hour
    minute = t.minute
    period = 'AM' if hour < 12 else 'PM'
    hour12 = hour % 12
    if hour12 == 0:
        hour12 = 12
    return f"{hour12}:{minute:02d} {period}"


# Weekly Availability Endpoints
@router.get("/weekly", response_model=List[WeeklyAvailabilityResponse])
def get_weekly_availability(
    lawyer_id: Optional[int] = Query(None, description="Filter by lawyer ID"),
    day_of_week: Optional[str] = Query(None, description="Filter by day of week"),
    db: Session = Depends(get_db)
):
    """Get weekly availability slots"""
    query = db.query(WeeklyAvailability).filter(WeeklyAvailability.is_active == True)
    
    if lawyer_id:
        query = query.filter(WeeklyAvailability.lawyer_id == lawyer_id)
    
    if day_of_week:
        try:
            day_enum = WeekDay(day_of_week.lower())
            query = query.filter(WeeklyAvailability.day_of_week == day_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid day of week: {day_of_week}"
            )
    
    return query.order_by(WeeklyAvailability.day_of_week, WeeklyAvailability.start_time).all()


@router.post("/weekly", response_model=WeeklyAvailabilityResponse, status_code=status.HTTP_201_CREATED)
def create_weekly_availability(
    slot_data: WeeklyAvailabilityCreate,
    lawyer_id: int = Query(..., description="Lawyer ID"),
    db: Session = Depends(get_db)
):
    """Create a new weekly availability slot"""
    
    # Verify lawyer exists
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lawyer not found"
        )
    
    # Verify branch exists
    branch = db.query(Branch).filter(Branch.id == slot_data.branch_id).first()
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found"
        )
    
    # Parse times
    start_time = parse_time_string(slot_data.start_time)
    end_time = parse_time_string(slot_data.end_time)
    
    # Check for overlapping slots
    existing = db.query(WeeklyAvailability).filter(
        and_(
            WeeklyAvailability.lawyer_id == lawyer_id,
            WeeklyAvailability.day_of_week == slot_data.day_of_week,
            WeeklyAvailability.is_active == True,
            or_(
                and_(
                    WeeklyAvailability.start_time <= start_time,
                    WeeklyAvailability.end_time > start_time
                ),
                and_(
                    WeeklyAvailability.start_time < end_time,
                    WeeklyAvailability.end_time >= end_time
                )
            )
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time slot overlaps with existing availability"
        )
    
    # Create new availability slot
    new_slot = WeeklyAvailability(
        lawyer_id=lawyer_id,
        branch_id=slot_data.branch_id,
        day_of_week=slot_data.day_of_week,
        start_time=start_time,
        end_time=end_time,
        max_bookings=slot_data.max_bookings
    )
    
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    
    return new_slot


@router.put("/weekly/{slot_id}", response_model=WeeklyAvailabilityResponse)
def update_weekly_availability(
    slot_id: int,
    slot_data: WeeklyAvailabilityUpdate,
    db: Session = Depends(get_db)
):
    """Update a weekly availability slot"""
    
    slot = db.query(WeeklyAvailability).filter(WeeklyAvailability.id == slot_id).first()
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability slot not found"
        )
    
    # Update fields if provided
    update_data = slot_data.dict(exclude_unset=True)
    
    if 'start_time' in update_data:
        update_data['start_time'] = parse_time_string(update_data['start_time'])
    
    if 'end_time' in update_data:
        update_data['end_time'] = parse_time_string(update_data['end_time'])
    
    if 'branch_id' in update_data:
        branch = db.query(Branch).filter(Branch.id == update_data['branch_id']).first()
        if not branch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Branch not found"
            )
    
    for field, value in update_data.items():
        setattr(slot, field, value)
    
    db.commit()
    db.refresh(slot)
    
    return slot


@router.delete("/weekly/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_weekly_availability(
    slot_id: int,
    db: Session = Depends(get_db)
):
    """Delete a weekly availability slot"""
    
    slot = db.query(WeeklyAvailability).filter(WeeklyAvailability.id == slot_id).first()
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability slot not found"
        )
    
    # Soft delete
    slot.is_active = False
    db.commit()


@router.post("/weekly/bulk", response_model=List[WeeklyAvailabilityResponse])
def create_bulk_weekly_availability(
    bulk_data: BulkWeeklyAvailabilityCreate,
    lawyer_id: int = Query(..., description="Lawyer ID"),
    db: Session = Depends(get_db)
):
    """Create multiple weekly availability slots"""
    
    # Verify lawyer exists
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lawyer not found"
        )
    
    created_slots = []
    
    for slot_data in bulk_data.slots:
        # Verify branch exists
        branch = db.query(Branch).filter(Branch.id == slot_data.branch_id).first()
        if not branch:
            continue  # Skip invalid branches
        
        # Parse times
        start_time = parse_time_string(slot_data.start_time)
        end_time = parse_time_string(slot_data.end_time)
        
        # Check for overlaps
        existing = db.query(WeeklyAvailability).filter(
            and_(
                WeeklyAvailability.lawyer_id == lawyer_id,
                WeeklyAvailability.day_of_week == slot_data.day_of_week,
                WeeklyAvailability.is_active == True,
                or_(
                    and_(
                        WeeklyAvailability.start_time <= start_time,
                        WeeklyAvailability.end_time > start_time
                    ),
                    and_(
                        WeeklyAvailability.start_time < end_time,
                        WeeklyAvailability.end_time >= end_time
                    )
                )
            )
        ).first()
        
        if existing:
            continue  # Skip overlapping slots
        
        # Create slot
        slot = WeeklyAvailability(
            lawyer_id=lawyer_id,
            branch_id=slot_data.branch_id,
            day_of_week=slot_data.day_of_week,
            start_time=start_time,
            end_time=end_time,
            max_bookings=slot_data.max_bookings
        )
        
        db.add(slot)
        created_slots.append(slot)
    
    db.commit()
    
    for slot in created_slots:
        db.refresh(slot)
    
    return created_slots


# Blackout Dates Endpoints
@router.get("/blackout", response_model=List[BlackoutDateResponse])
def get_blackout_dates(
    lawyer_id: Optional[int] = Query(None, description="Filter by lawyer ID"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    db: Session = Depends(get_db)
):
    """Get blackout dates"""
    query = db.query(BlackoutDate).filter(BlackoutDate.is_active == True)
    
    if lawyer_id:
        query = query.filter(BlackoutDate.lawyer_id == lawyer_id)
    
    if start_date:
        query = query.filter(BlackoutDate.date >= start_date)
    
    if end_date:
        query = query.filter(BlackoutDate.date <= end_date)
    
    return query.order_by(BlackoutDate.date).all()


@router.post("/blackout", response_model=BlackoutDateResponse, status_code=status.HTTP_201_CREATED)
def create_blackout_date(
    blackout_data: BlackoutDateCreate,
    lawyer_id: int = Query(..., description="Lawyer ID"),
    db: Session = Depends(get_db)
):
    """Create a new blackout date"""
    
    # Verify lawyer exists
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lawyer not found"
        )
    
    # Check for existing blackout on same date
    existing = db.query(BlackoutDate).filter(
        and_(
            BlackoutDate.lawyer_id == lawyer_id,
            BlackoutDate.date == blackout_data.date,
            BlackoutDate.is_active == True
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blackout date already exists for this date"
        )
    
    # Parse times if partial time
    start_time = None
    end_time = None
    
    if blackout_data.availability_type == "partial_time":
        if not blackout_data.start_time or not blackout_data.end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start and end times required for partial time blackout"
            )
        start_time = parse_time_string(blackout_data.start_time)
        end_time = parse_time_string(blackout_data.end_time)
    
    # Create blackout date
    blackout = BlackoutDate(
        lawyer_id=lawyer_id,
        date=blackout_data.date,
        availability_type=blackout_data.availability_type,
        start_time=start_time,
        end_time=end_time,
        reason=blackout_data.reason
    )
    
    db.add(blackout)
    db.commit()
    db.refresh(blackout)
    
    return blackout


@router.delete("/blackout/{blackout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blackout_date(
    blackout_id: int,
    db: Session = Depends(get_db)
):
    """Delete a blackout date"""
    
    blackout = db.query(BlackoutDate).filter(BlackoutDate.id == blackout_id).first()
    if not blackout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blackout date not found"
        )
    
    # Soft delete
    blackout.is_active = False
    db.commit()


@router.post("/blackout/bulk", response_model=List[BlackoutDateResponse])
def create_bulk_blackout_dates(
    bulk_data: BulkBlackoutDateCreate,
    lawyer_id: int = Query(..., description="Lawyer ID"),
    db: Session = Depends(get_db)
):
    """Create multiple blackout dates"""
    
    # Verify lawyer exists
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lawyer not found"
        )
    
    created_blackouts = []
    
    for blackout_data in bulk_data.dates:
        # Check for existing blackout on same date
        existing = db.query(BlackoutDate).filter(
            and_(
                BlackoutDate.lawyer_id == lawyer_id,
                BlackoutDate.date == blackout_data.date,
                BlackoutDate.is_active == True
            )
        ).first()
        
        if existing:
            continue  # Skip duplicates
        
        # Parse times if partial time
        start_time = None
        end_time = None
        
        if blackout_data.availability_type == "partial_time":
            if blackout_data.start_time and blackout_data.end_time:
                start_time = parse_time_string(blackout_data.start_time)
                end_time = parse_time_string(blackout_data.end_time)
        
        # Create blackout date
        blackout = BlackoutDate(
            lawyer_id=lawyer_id,
            date=blackout_data.date,
            availability_type=blackout_data.availability_type,
            start_time=start_time,
            end_time=end_time,
            reason=blackout_data.reason
        )
        
        db.add(blackout)
        created_blackouts.append(blackout)
    
    db.commit()
    
    for blackout in created_blackouts:
        db.refresh(blackout)
    
    return created_blackouts


# Combined Endpoints
@router.get("/lawyer/{lawyer_id}", response_model=LawyerAvailabilityResponse)
def get_lawyer_complete_availability(
    lawyer_id: int,
    db: Session = Depends(get_db)
):
    """Get complete availability for a lawyer (weekly + blackout)"""
    
    # Verify lawyer exists
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lawyer not found"
        )
    
    # Get weekly availability with branch relationship
    from sqlalchemy.orm import joinedload
    weekly_slots = db.query(WeeklyAvailability).options(
        joinedload(WeeklyAvailability.branch)
    ).filter(
        and_(
            WeeklyAvailability.lawyer_id == lawyer_id,
            WeeklyAvailability.is_active == True
        )
    ).order_by(WeeklyAvailability.day_of_week, WeeklyAvailability.start_time).all()
    
    # Get blackout dates
    blackout_dates = db.query(BlackoutDate).filter(
        and_(
            BlackoutDate.lawyer_id == lawyer_id,
            BlackoutDate.is_active == True,
            BlackoutDate.date >= date.today()
        )
    ).order_by(BlackoutDate.date).all()
    
    # Calculate statistics
    total_weekly_hours = 0
    for slot in weekly_slots:
        start_minutes = time_to_minutes(slot.start_time)
        end_minutes = time_to_minutes(slot.end_time)
        total_weekly_hours += (end_minutes - start_minutes) / 60
    
    total_daily_capacity = sum(slot.max_bookings for slot in weekly_slots)
    active_blackouts = len(blackout_dates)
    
    return LawyerAvailabilityResponse(
        weekly_slots=weekly_slots,
        blackout_dates=blackout_dates,
        total_weekly_hours=total_weekly_hours,
        total_daily_capacity=total_daily_capacity,
        active_blackouts=active_blackouts
    )


@router.get("/status/{lawyer_id}", response_model=AvailabilityStatus)
def get_availability_status(
    lawyer_id: int,
    db: Session = Depends(get_db)
):
    """Get availability status summary for a lawyer"""
    
    # Verify lawyer exists
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lawyer not found"
        )
    
    # Get counts and calculations
    weekly_slots = db.query(WeeklyAvailability).filter(
        and_(
            WeeklyAvailability.lawyer_id == lawyer_id,
            WeeklyAvailability.is_active == True
        )
    ).all()
    
    blackout_dates = db.query(BlackoutDate).filter(
        and_(
            BlackoutDate.lawyer_id == lawyer_id,
            BlackoutDate.is_active == True,
            BlackoutDate.date >= date.today()
        )
    ).all()
    
    total_weekly_hours = 0
    for slot in weekly_slots:
        start_minutes = time_to_minutes(slot.start_time)
        end_minutes = time_to_minutes(slot.end_time)
        total_weekly_hours += (end_minutes - start_minutes) / 60
    
    total_daily_capacity = sum(slot.max_bookings for slot in weekly_slots)
    
    return AvailabilityStatus(
        total_weekly_hours=total_weekly_hours,
        total_daily_capacity=total_daily_capacity,
        active_blackouts=len(blackout_dates),
        weekly_slots_count=len(weekly_slots),
        blackout_dates_count=len(blackout_dates)
    )


@router.get("/branches", response_model=List[BranchInfo])
def get_branches(db: Session = Depends(get_db)):
    """Get all branches for dropdown"""
    return db.query(Branch).filter(Branch.name.isnot(None)).order_by(Branch.name).all()
