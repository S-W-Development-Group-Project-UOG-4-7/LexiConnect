from fastapi import APIRouter

router = APIRouter(tags=["Documents"])

# Note: prefix will be configured in main.py as "/bookings"


@router.get("/{booking_id}/documents")
def get_booking_documents_dummy(booking_id: int):
    """Return a list of fake documents for a booking."""
    return [
        {
            "id": 1,
            "booking_id": booking_id,
            "file_name": "NIC.pdf",
            "uploaded_at": "2025-12-01T10:00:00Z",
        },
        {
            "id": 2,
            "booking_id": booking_id,
            "file_name": "Contract.docx",
            "uploaded_at": "2025-12-02T11:30:00Z",
        },
    ]
