from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin():
    """
    Placeholder dependency for admin privileges.
    TODO: Replace with actual authentication/authorization logic.
    For now, this is a placeholder that always passes.
    """
    # Placeholder: In production, this would check:
    # - User is authenticated
    # - User has admin role
    # - Return user object or raise HTTPException if not authorized
    return {"user_id": 1, "role": "admin"}


@router.get("/overview")
def admin_overview(admin_user: dict = Depends(require_admin)):
    """
    Get admin dashboard overview.
    Requires admin privileges.
    """
    return {
        "message": "Admin overview endpoint",
        "admin_user": admin_user,
        "total_users": 0,
        "total_lawyers": 0,
        "total_bookings": 0,
        "pending_kyc": 0,
    }


@router.get("/health")
def admin_health_check(admin_user: dict = Depends(require_admin)):
    """
    Admin health check endpoint.
    Requires admin privileges.
    """
    return {
        "status": "ok",
        "message": "Admin router is working",
        "admin_user": admin_user,
    }

