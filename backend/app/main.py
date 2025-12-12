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

app = FastAPI(title="LexiConnect API")


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Include routers
app.include_router(auth.router)
app.include_router(lawyers.router)
app.include_router(bookings.router)
# documents router will be mounted under /bookings
app.include_router(documents.router)
app.include_router(admin.router)
app.include_router(availability.router)
app.include_router(branches.router)
app.include_router(kyc.router)
