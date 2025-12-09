from fastapi import APIRouter
from typing import Optional

router = APIRouter(prefix="/branches", tags=["Branches"])


@router.get("")
def list_branches_dummy(lawyer_id: Optional[int] = None):
    """Return dummy branches for a lawyer."""
    return [
        {
            "id": 1,
            "lawyer_id": lawyer_id or 1,
            "name": "Main Chamber",
            "district": "Colombo",
            "city": "Colombo 03",
            "address": "123 Galle Road",
        },
        {
            "id": 2,
            "lawyer_id": lawyer_id or 1,
            "name": "Negombo Office",
            "district": "Gampaha",
            "city": "Negombo",
            "address": "456 Beach Road",
        },
    ]
