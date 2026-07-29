from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_home():
    response = client.get("/")
    assert response.status_code == 200


def test_login_without_credentials():
    response = client.post(
        "/auth/login",
        json={}
    )

    # The endpoint should reject an empty request.
    assert response.status_code in [400, 401, 422]