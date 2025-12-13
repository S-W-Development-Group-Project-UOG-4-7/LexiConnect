[11 tools called]

Replace the contents of `backend/app/routers/documents.py` with:

```python
import os
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentOut

router = APIRouter(tags=["Documents"])

UPLOAD_DIR = "uploads"


@router.post("/{booking_id}/documents", response_model=DocumentOut)
def upload_document(
    booking_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file:
        raise HTTPException(status_code=400, detail="File is required.")
    if booking_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid booking_id.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    _, ext = os.path.splitext(file.filename or "")
    unique_name = f"{uuid4().hex}{ext}"
    relative_path = os.path.join(UPLOAD_DIR, unique_name)
    absolute_path = os.path.abspath(relative_path)

    contents = file.file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="File is empty.")

    with open(absolute_path, "wb") as buffer:
        buffer.write(contents)

    document = Document(
        booking_id=booking_id,
        file_name=file.filename,
        file_path=relative_path,
        uploaded_at=datetime.utcnow(),
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("/{booking_id}/documents", response_model=list[DocumentOut])
def list_documents(booking_id: int, db: Session = Depends(get_db)):
    if booking_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid booking_id.")

    return db.query(Document).filter(Document.booking_id == booking_id).all()
```