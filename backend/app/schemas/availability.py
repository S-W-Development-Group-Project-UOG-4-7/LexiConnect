from datetime import datetime

from pydantic import BaseModel, ConfigDict, conint


class AvailabilityBase(BaseModel):
    lawyer_id: int
    branch_id: int
    start_time: datetime
    end_time: datetime
    max_bookings: conint(gt=0) = 1


class AvailabilityCreate(AvailabilityBase):
    pass


class AvailabilityOut(AvailabilityBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

