from typing import List, Optional
from pydantic import BaseModel


class ChecklistAnswerUpdate(BaseModel):
    booking_id: int
    template_id: int
    checked: bool


class ChecklistItemOut(BaseModel):
    template_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    required: bool = False
    checked: bool
    answer_text: Optional[str] = None
    document_id: Optional[int] = None


class ChecklistMissingItem(BaseModel):
    id: int
    title: Optional[str] = None
    description: Optional[str] = None


class BookingChecklistAnswersResponse(BaseModel):
    booking_id: int
    case_id: Optional[int] = None
    service_package_id: Optional[int] = None
    total_items: int
    completed_items: int
    items: List[ChecklistItemOut]
    missing_required: List[ChecklistMissingItem]


class ChecklistAnswerUpdateResponse(BaseModel):
    booking_id: int
    template_id: int
    checked: bool
    answer_text: Optional[str] = None
    document_id: Optional[int] = None
    case_id: Optional[int] = None
