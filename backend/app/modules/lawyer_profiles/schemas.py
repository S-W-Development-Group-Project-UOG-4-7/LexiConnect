from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class LawyerProfileBase(BaseModel):
    district: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    specialization: Optional[str] = Field(None, max_length=255)
    languages: Optional[List[str]] = None
    years_of_experience: Optional[int] = None
    bio: Optional[str] = None
    rating: Optional[float] = None
    is_verified: Optional[bool] = None


class LawyerProfileCreate(LawyerProfileBase):
    user_id: int


class LawyerProfileUpdate(LawyerProfileBase):
    pass


class LawyerProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    district: Optional[str] = None
    city: Optional[str] = None
    specialization: Optional[str] = None
    languages: Optional[List[str]] = None
    years_of_experience: Optional[int] = None
    bio: Optional[str] = None
    rating: Optional[float] = None
    is_verified: bool
    created_at: str
    updated_at: str
