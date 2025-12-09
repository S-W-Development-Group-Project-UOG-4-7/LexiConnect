from fastapi import APIRouter
from typing import List, Optional

router = APIRouter(prefix="/lawyers", tags=["Lawyers"])


@router.get("")
def list_lawyers(
    district: Optional[str] = None,
    city: Optional[str] = None,
    specialization: Optional[str] = None,
    language: Optional[str] = None,
):
    """Return a hard-coded list of lawyers for now."""
    lawyers = [
        {
            "id": 1,
            "full_name": "A. Perera",
            "specialization": "Criminal Law",
            "district": "Colombo",
            "city": "Colombo 03",
            "languages": ["Sinhala", "English"],
            "rating": 4.5,
        },
        {
            "id": 2,
            "full_name": "B. Silva",
            "specialization": "Family Law",
            "district": "Gampaha",
            "city": "Negombo",
            "languages": ["Sinhala"],
            "rating": 4.2,
        },
    ]
    # Later you will filter by the query params. For now we return all.
    return lawyers


@router.get("/{lawyer_id}")
def get_lawyer_profile(lawyer_id: int):
    """Return dummy profile data for one lawyer."""
    return {
        "id": lawyer_id,
        "full_name": "Dummy Lawyer",
        "specialization": "Criminal Law",
        "district": "Colombo",
        "city": "Colombo 03",
        "languages": ["Sinhala", "English"],
        "years_of_experience": 8,
        "is_verified": True,
        "branches": [
            {
                "id": 1,
                "name": "Main Chamber",
                "district": "Colombo",
                "city": "Colombo 03",
                "address": "123 Galle Road",
            }
        ],
        "reviews": [
            {
                "id": 1,
                "rating": 5,
                "comment": "Very helpful and professional.",
            }
        ],
    }
