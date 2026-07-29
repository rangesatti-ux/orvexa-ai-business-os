from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_employees_unauthorized():
    response = client.get("/employees")

    # This endpoint should not be accessible without authentication.
    assert response.status_code in [401, 403]