import uuid
from fastapi.testclient import TestClient
from main import app
from app.database.connection import get_db
from app.models.user import User
from app.utils.security import hash_password

client = TestClient(app)


def test_public_registration_disabled():
    """Verify that public self-registration is disabled and returns 403 Forbidden."""
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Public Registrant",
            "email": "public@test.com",
            "password": "Password123!",
            "role": "Employee",
        },
    )
    assert response.status_code == 403
    
    payload = response.json()
    error_msg = payload.get("detail") or payload.get("message") or str(payload)
    assert "Public registration is disabled" in error_msg


def test_login_and_get_current_user():
    """Seed user account directly into DB session and test login + /auth/me payload."""
    email = f"pytest_{uuid.uuid4().hex[:8]}@test.com"
    password = "Test@12345"

    db = next(get_db())
    db_user = User(
        full_name="Pytest User",
        email=email,
        password=hash_password(password),
        role="Admin",
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    login_response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert me_response.status_code == 200
    user_data = me_response.json()
    assert user_data["email"] == email