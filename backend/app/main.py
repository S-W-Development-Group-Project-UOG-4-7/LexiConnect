from fastapi import FastAPI

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
from .api.v1 import admin as admin_v1, booking as booking_v1

app = FastAPI(title="LexiConnect API")


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Include routers
app.include_router(auth.router)
app.include_router(lawyers.router)
app.include_router(bookings.router)
# documents router will be mounted under /bookings
app.include_router(documents.router, prefix="/bookings")
app.include_router(admin.router)
app.include_router(availability.router)
app.include_router(branches.router)
app.include_router(kyc.router)

# Include API v1 routers
app.include_router(admin_v1.router)
app.include_router(booking_v1.router)
