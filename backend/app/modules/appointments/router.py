from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.modules.appointments.service import delete_appointment

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment_endpoint(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_appointment(db, appointment_id=appointment_id, current_user=current_user)
    return None
