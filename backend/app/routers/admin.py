from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview")
def admin_overview():
    """Return admin dashboard overview statistics."""
    return {
        "total_users": 25,
        "total_lawyers": 8,
        "total_bookings": 42,
        "pending_kyc": 3,
    }