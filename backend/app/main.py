# backend/app/main.py

# Load environment variables first
from dotenv import load_dotenv

load_dotenv()

# Third-party imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles  # ✅ for serving uploads

# Core DB
from .database import Base, engine, SessionLocal

# Ensure models are loaded (so Alembic / SQLAlchemy sees them)
# Add/remove here only if these models exist in backend/app/models
from .models import (  # noqa
    branch,
    kyc_submission,
    lawyer,
    lawyer_availability,
    service_package,
    checklist_template,
)

# Routers (existing app routers)
from .routers import admin, auth, bookings, dev, lawyers, token_queue  # noqa: F401

# Module routers (new modular structure)
from app.modules.kyc.router import router as kyc_router
from app.modules.branches.router import router as branches_router
from app.modules.service_packages.router import router as service_packages_router
from app.modules.checklist_templates.router import router as checklist_router

from app.modules.disputes.routes import (
    router as disputes_router,
    admin_router as admin_disputes_router,
    booking_router as booking_disputes_router,
)

from app.modules.documents.routes import router as documents_router
from app.modules.intake.routes import router as intake_router

# API v1 routers
from .api.v1 import admin as admin_v1, booking as booking_v1

# Seed
from app.seed import seed_all

# Create all database tables (dev-friendly)
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(
    title="LexiConnect API",
    version="0.1.0",
    swagger_ui_parameters={"persistAuthorization": True},
)

# ✅ Serve uploaded files so frontend can open PDFs/images in browser
# Example URL: http://127.0.0.1:8000/uploads/documents/<file>.pdf
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ---- CORS for React (Vite) frontend ----
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^http:\/\/(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Startup seed ----
@app.on_event("startup")
def startup():
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()


# ---- Health check ----
@app.get("/health")
def health_check():
    return {"status": "ok"}


# ---- Routers ----

# Core auth/booking/lawyers
app.include_router(auth.router)
app.include_router(lawyers.router)
app.include_router(bookings.router)
app.include_router(token_queue.router)

# Feature modules
app.include_router(service_packages_router)
app.include_router(checklist_router)

# Admin / Dev / Branches / KYC
app.include_router(admin.router)
app.include_router(branches_router)
app.include_router(kyc_router)
app.include_router(dev.router)  # DEV-ONLY endpoints

# Modules (grouped to avoid duplicate includes and Swagger noise)
for module_router in (
    disputes_router,
    admin_disputes_router,
    booking_disputes_router,
    documents_router,
    intake_router,
):
    app.include_router(module_router)

# API v1 routers
app.include_router(admin_v1.router)
app.include_router(booking_v1.router)


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
