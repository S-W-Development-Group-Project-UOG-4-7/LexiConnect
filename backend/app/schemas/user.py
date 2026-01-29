from datetime import datetime
from typing import Optional, Union, List

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole  # ✅ use the same enum as your SQLAlchemy model


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole = UserRole.client  # ✅ validated enum (client/lawyer/admin/apprentice)


class UserCreate(UserBase):
    password: str
    district: Optional[str] = None
    city: Optional[str] = None
    specialization: Optional[str] = None
    languages: Optional[Union[str, List[str]]] = None
    years_of_experience: Optional[int] = None
    bio: Optional[str] = None


class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # ✅ pydantic v2 (works better than orm_mode)
