from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.models.user import User, UserRole


def delete_appointment(db: Session, *, appointment_id: int, current_user: User) -> None:
    appointment = db.get(Appointment, appointment_id)
    if appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    is_admin = getattr(current_user, "role", None) in (UserRole.admin, "admin")
    if (not is_admin) and appointment.lawyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed",
        )

    db.delete(appointment)
    db.commit()
