from fastapi import APIRouter

router = APIRouter(prefix="/kyc", tags=["KYC"])


@router.get("/my")
def get_my_kyc_status_dummy():
    """Return a dummy KYC status for the current lawyer."""
    return {
        "status": "PENDING",
        "submitted_at": "2025-12-01T09:00:00Z",
        "message": "This is dummy KYC data. Real workflow will be implemented later.",
    }
