# Load environment variables first
from dotenv import load_dotenv
load_dotenv()

# Third-party imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

# Safe module routers
from app.modules.kyc.router import router as kyc_router
from app.modules.disputes.routes import router as disputes_router

from .api.v1 import admin as admin_v1, booking as booking_v1
from .database import Base, engine, SessionLocal

# Ensure models are loaded
from .models import branch, kyc_submission, lawyer  # noqa

from .seed import seed_demo_users

# IMPORTANT:
# - documents module disabled (missing Document model)
# - old availability router disabled (missing availability_v2 model)

from .routers import (
    admin,
    auth,
    bookings,
    branches,
    dev,
    lawyers,
    token_queue,
)

# Create all database tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(
    title="LexiConnect API",
    version="0.1.0",
    swagger_ui_parameters={"persistAuthorization": True},
)

# ---- CORS for React (Vite) frontend ----
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Startup seed ----
@app.on_event("startup")
def startup_seed_users():
    db = SessionLocal()
    try:
        seed_demo_users(db)
    finally:
        db.close()

# ---- Health check ----
@app.get("/health")
def health_check():
    return {"status": "ok"}

# ---- Routers ----
app.include_router(auth.router)
app.include_router(lawyers.router)
app.include_router(bookings.router)

# ❌ Documents router disabled
# app.include_router(documents.router, prefix="/bookings")

app.include_router(admin.router)
app.include_router(branches.router)

# ❌ Old availability router disabled
# app.include_router(availability.router)

# KYC, dev-only, token queue
app.include_router(kyc_router)
app.include_router(dev.router)
app.include_router(token_queue.router)

# API v1 routers
app.include_router(admin_v1.router)
app.include_router(booking_v1.router)

# Disputes API
app.include_router(disputes_router, prefix="/api/disputes", tags=["Disputes"])

# ---- Custom OpenAPI (JWT Bearer Auth in Swagger) ----
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description="LexiConnect backend API",
        routes=app.routes,
    )

    openapi_schema.setdefault("components", {})
    openapi_schema["components"].setdefault("securitySchemes", {})
    openapi_schema["components"]["securitySchemes"]["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }

    openapi_schema["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return openapi_schema

app.openapi = custom_openapi
