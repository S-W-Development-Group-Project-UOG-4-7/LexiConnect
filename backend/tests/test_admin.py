import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.lawyer_kyc import LawyerKYC, KYCStatus


# Create a test database (in-memory SQLite)
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def test_db():
    """Create test database tables and yield a test session."""
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(test_db):
    """Create a test client with overridden database dependency."""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def sample_kyc_record(test_db):
    """Create a sample KYC record for testing."""
    kyc = LawyerKYC(
        user_id=1,
        nic_number="123456789V",
        bar_association_id="BAR001",
        bar_certificate_path="/path/to/cert.pdf",
        status=KYCStatus.PENDING,
    )
    test_db.add(kyc)
    test_db.commit()
    test_db.refresh(kyc)
    return kyc


def test_get_pending_kyc_status_code(client, sample_kyc_record):
    """Test that GET /kyc/pending returns status code 200."""
    response = client.get("/kyc/pending")
    assert response.status_code == 200


def test_get_pending_kyc_returns_list(client, sample_kyc_record):
    """Test that GET /kyc/pending returns a list of pending KYC records."""
    response = client.get("/kyc/pending")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["status"] == "Pending"


def test_post_approve_kyc(client, sample_kyc_record):
    """Test that POST /kyc/{lawyer_id}/approve successfully approves a KYC record."""
    lawyer_id = sample_kyc_record.user_id
    response = client.post(f"/kyc/{lawyer_id}/approve")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Approved"
    assert data["user_id"] == lawyer_id
    assert data["id"] == sample_kyc_record.id


def test_post_approve_kyc_nonexistent(client):
    """Test that POST /kyc/{lawyer_id}/approve returns 404 for non-existent lawyer."""
    response = client.post("/kyc/999/approve")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

