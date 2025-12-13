from fastapi import APIRouter
from typing import Optional

router = APIRouter(prefix="/availability", tags=["Availability"])


@router.post("")
def create_availability_slot_dummy():
    """Create a dummy availability slot."""
    return {
        "id": 1,
        "lawyer_id": 1,
        "branch_id": 1,
        "start_time": "2025-12-10T09:00:00Z",
        "end_time": "2025-12-10T10:00:00Z",
        "max_bookings": 4,
    }


@router.get("")
def list_availability_slots_dummy(lawyer_id: Optional[int] = None):
    """Return dummy availability slots for a lawyer."""
    return [
        {
            "id": 1,
            "lawyer_id": lawyer_id or 1,
            "branch_id": 1,
            "start_time": "2025-12-10T09:00:00Z",
            "end_time": "2025-12-10T10:00:00Z",
            "max_bookings": 4,
        },
        {
            "id": 2,
            "lawyer_id": lawyer_id or 1,
            "branch_id": 1,
            "start_time": "2025-12-10T10:00:00Z",
            "end_time": "2025-12-10T11:00:00Z",
            "max_bookings": 4,
        },
    ]
