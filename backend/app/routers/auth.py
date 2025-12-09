from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register_dummy():
    """Temporary dummy register endpoint."""
    return {
        "id": 1,
        "email": "dummy@example.com",
        "message": "This is a dummy register endpoint. Real logic coming soon."
    }


@router.post("/login")
def login_dummy():
    """Temporary dummy login endpoint."""
    return {
        "access_token": "dummy-token",
        "token_type": "bearer",
        "message": "This is a dummy login endpoint."
    }
