from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)


def test_login_and_get_current_user():

    email = f"pytest_{uuid.uuid4().hex[:8]}@test.com"

    password = "Test@12345"

    register_response = client.post(
        "/auth/register",
        json={
            "full_name": "Pytest User",
            "email": email,
            "password": password,
            "role": "admin"
        }
    )

    assert register_response.status_code == 200

    login_response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password
        }
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    me_response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert me_response.status_code == 200

    user = me_response.json()

    assert user["email"] == email