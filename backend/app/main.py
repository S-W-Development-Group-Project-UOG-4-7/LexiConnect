from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware   # ⭐ ADD THIS

from .routers import (
    auth,
    lawyers,
    bookings,
    documents,
    admin,
    availability,
    branches,
    kyc,
)

from .database import Base, engine

# import all models so tables get created
from .models import lawyer
from .models import branch
from .models import kyc_submission

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LexiConnect API")

# ⭐⭐ CORS FIX — THIS ALLOWS FRONTEND TO TALK TO BACKEND ⭐⭐
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Allow any frontend (React dev server)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}


# Routers
app.include_router(auth.router)
app.include_router(lawyers.router)
app.include_router(bookings.router)
app.include_router(documents.router, prefix="/bookings")
app.include_router(admin.router)
app.include_router(availability.router)
app.include_router(branches.router)
app.include_router(kyc.router)   # include only once
