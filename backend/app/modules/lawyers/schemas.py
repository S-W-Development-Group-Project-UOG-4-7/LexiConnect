from pydantic import BaseModel
from typing import Optional

class LawyerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    location: Optional[str] = None
