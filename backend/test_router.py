from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, date

router = APIRouter(prefix="/api/lawyer-availability", tags=["Lawyer Availability"])

class WeeklyAvailabilityBase(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    branch_id: int
    max_bookings: int

class WeeklyAvailabilityResponse(WeeklyAvailabilityBase):
    id: str
    lawyer_id: int
    is_active: bool
    created_at: str
    branch: dict = None

class BranchInfo(BaseModel):
    id: int
    name: str
    city: str
    district: str

# Blackout date schemas
class BlackoutDateBase(BaseModel):
    date: str  # YYYY-MM-DD format
    availability_type: str  # "full_day" or "partial_time"
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    reason: Optional[str] = None

class BlackoutDateCreate(BlackoutDateBase):
    pass

class BlackoutDateResponse(BlackoutDateBase):
    id: str
    lawyer_id: int
    is_active: bool
    created_at: str

# Mock data storage for availability_templates
mock_templates = []
mock_blackouts = []
mock_branches = [
    {"id": 1, "name": "Colombo Main Branch", "city": "Colombo", "district": "Colombo"},
    {"id": 2, "name": "Galle Branch", "city": "Galle", "district": "Galle"}
]

@router.get("/branches", response_model=List[BranchInfo])
def get_branches():
    return mock_branches

@router.get("/lawyer/{lawyer_id}")
def get_lawyer_availability(lawyer_id: int):
    # Convert templates to expected format
    weekly_slots = []
    for template in mock_templates:
        if template["lawyer_id"] == lawyer_id:
            weekly_slots.append({
                "id": template["id"],
                "day_of_week": template["day_of_week"],
                "start_time": template["start_time"],
                "end_time": template["end_time"],
                "max_bookings": template["slot_minutes"] // 60,
                "is_active": template["is_active"]
            })
    
    return {
        "weekly_slots": weekly_slots,
        "blackout_dates": [],
        "total_weekly_hours": sum(t["slot_minutes"] for t in mock_templates if t["lawyer_id"] == lawyer_id) / 60,
        "total_daily_capacity": len(weekly_slots),
        "active_blackouts": 0
    }

@router.post("/weekly", response_model=WeeklyAvailabilityResponse)
def create_weekly_availability(
    slot_data: WeeklyAvailabilityBase,
    lawyer_id: int = Query(...)
):
    # Create template entry (simulating availability_templates table)
    new_template = {
        "id": str(uuid.uuid4()),
        "lawyer_id": lawyer_id,
        "day_of_week": slot_data.day_of_week,
        "start_time": slot_data.start_time,
        "end_time": slot_data.end_time,
        "slot_minutes": 480,  # Default 8 hours
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
    mock_templates.append(new_template)
    
    # Return in expected format
    return WeeklyAvailabilityResponse(
        id=new_template["id"],
        lawyer_id=new_template["lawyer_id"],
        day_of_week=new_template["day_of_week"],
        start_time=new_template["start_time"],
        end_time=new_template["end_time"],
        branch_id=slot_data.branch_id,
        max_bookings=new_template["slot_minutes"] // 60,
        is_active=new_template["is_active"],
        created_at=new_template["created_at"],
        branch=mock_branches[0]
    )

@router.put("/weekly/{slot_id}", response_model=WeeklyAvailabilityResponse)
def update_weekly_availability(slot_id: str, slot_data: WeeklyAvailabilityBase):
    for template in mock_templates:
        if template["id"] == slot_id:
            template["day_of_week"] = slot_data.day_of_week
            template["start_time"] = slot_data.start_time
            template["end_time"] = slot_data.end_time
            template["slot_minutes"] = 480  # Default 8 hours
            
            return WeeklyAvailabilityResponse(
                id=template["id"],
                lawyer_id=template["lawyer_id"],
                day_of_week=template["day_of_week"],
                start_time=template["start_time"],
                end_time=template["end_time"],
                branch_id=slot_data.branch_id,
                max_bookings=template["slot_minutes"] // 60,
                is_active=template["is_active"],
                created_at=template["created_at"],
                branch=mock_branches[0]
            )
    raise HTTPException(status_code=404, detail="Slot not found")

@router.delete("/weekly/{slot_id}")
def delete_weekly_availability(slot_id: str):
    global mock_templates
    mock_templates = [t for t in mock_templates if t["id"] != slot_id]
    return {"status": "deleted"}

# Blackout Dates Endpoints
@router.get("/blackout", response_model=List[BlackoutDateResponse])
def get_blackout_dates(lawyer_id: int = Query(...)):
    """Get blackout dates for a lawyer"""
    lawyer_blackouts = [
        BlackoutDateResponse(
            id=str(blackout["id"]),
            lawyer_id=blackout["lawyer_id"],
            date=blackout["date"],
            availability_type=blackout["availability_type"],
            start_time=blackout.get("start_time"),
            end_time=blackout.get("end_time"),
            reason=blackout.get("reason"),
            is_active=blackout["is_active"],
            created_at=blackout["created_at"]
        )
        for blackout in mock_blackouts
        if blackout["lawyer_id"] == lawyer_id and blackout["is_active"]
    ]
    return lawyer_blackouts

@router.post("/blackout", response_model=BlackoutDateResponse, status_code=201)
def create_blackout_date(
    blackout_data: BlackoutDateCreate,
    lawyer_id: int = Query(...)
):
    """Create a new blackout date"""
    new_blackout = {
        "id": str(uuid.uuid4()),
        "lawyer_id": lawyer_id,
        "date": blackout_data.date,
        "availability_type": blackout_data.availability_type,
        "start_time": blackout_data.start_time,
        "end_time": blackout_data.end_time,
        "reason": blackout_data.reason,
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
    mock_blackouts.append(new_blackout)
    
    return BlackoutDateResponse(
        id=new_blackout["id"],
        lawyer_id=new_blackout["lawyer_id"],
        date=new_blackout["date"],
        availability_type=new_blackout["availability_type"],
        start_time=new_blackout["start_time"],
        end_time=new_blackout["end_time"],
        reason=new_blackout["reason"],
        is_active=new_blackout["is_active"],
        created_at=new_blackout["created_at"]
    )

@router.delete("/blackout/{blackout_id}", status_code=204)
def delete_blackout_date(blackout_id: str):
    """Delete a blackout date"""
    global mock_blackouts
    mock_blackouts = [b for b in mock_blackouts if b["id"] != blackout_id]
    return None
