from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

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

app = FastAPI(
    title="LexiConnect API",
    version="0.1.0",
    swagger_ui_parameters={"persistAuthorization": True},
)

# ---- CORS for React frontend ----
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # your Vite dev URLs
    allow_credentials=True,
    allow_methods=["*"],         # GET, POST, PATCH, OPTIONS, etc.
    allow_headers=["*"],         # Authorization, Content-Type, etc.
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

# ---- Custom OpenAPI schema to add BearerAuth (JWT) to Swagger ----

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description="LexiConnect backend API",
        routes=app.routes,
    )

    # Add JWT Bearer security scheme
    openapi_schema.setdefault("components", {})
    openapi_schema["components"].setdefault("securitySchemes", {})
    openapi_schema["components"]["securitySchemes"]["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }

    # Apply this security scheme globally (all endpoints)
    openapi_schema["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return openapi_schema


app.openapi = custom_openapi
