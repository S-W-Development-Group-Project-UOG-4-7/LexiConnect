from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("")
def create_booking_dummy():
    """Return a fake booking as if it was created."""
    return {
        "id": 1,
        "client_id": 10,
        "lawyer_id": 1,
        "branch_id": 1,
        "date": "2025-12-10",
        "time": "10:00",
        "status": "PENDING",
        "created_at": datetime.utcnow().isoformat(),
    }


@router.get("/my")
def list_my_bookings_dummy():
    """Return a list of fake bookings for the current user."""
    return [
        {
            "id": 1,
            "lawyer_name": "A. Perera",
            "branch_name": "Main Chamber",
            "date": "2025-12-10",
            "time": "10:00",
            "status": "PENDING",
        },
        {
            "id": 2,
            "lawyer_name": "B. Silva",
            "branch_name": "Negombo Office",
            "date": "2025-12-12",
            "time": "14:00",
            "status": "CONFIRMED",
        },
    ]


@router.patch("/{booking_id}/cancel")
def cancel_booking_dummy(booking_id: int):
    """Return a booking marked as cancelled."""
    return {
        "id": booking_id,
        "status": "CANCELLED",
        "message": "This is a dummy cancel endpoint.",
    }
