import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.user import User, UserRole


SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        user = User(
            id=1,
            full_name="Test Lawyer",
            email="lawyer1@test.com",
            phone=None,
            hashed_password="hashed",
            role=UserRole.lawyer,
        )
        db.add(user)
        db.commit()
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(test_db):
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_create_availability_slot_success(client):
    payload = {
        "start_time": "2030-01-01T10:00:00",
        "end_time": "2030-01-01T11:00:00",
        "branch_id": None,
        "max_bookings": 1,
    }

    res = client.post("/availability", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["lawyer_id"] == 1
    assert data["is_active"] is True


def test_create_availability_slot_overlap_returns_409(client):
    first = {
        "start_time": "2030-01-01T10:00:00",
        "end_time": "2030-01-01T11:00:00",
        "branch_id": None,
        "max_bookings": 1,
    }
    second = {
        "start_time": "2030-01-01T10:30:00",
        "end_time": "2030-01-01T11:30:00",
        "branch_id": None,
        "max_bookings": 1,
    }

    res1 = client.post("/availability", json=first)
    assert res1.status_code == 201

    res2 = client.post("/availability", json=second)
    assert res2.status_code == 409
