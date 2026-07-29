from fastapi.testclient import TestClient
from main import app
import uuid
from datetime import date

client = TestClient(app)


def get_admin_token():
    email = f"admin_{uuid.uuid4().hex[:8]}@test.com"
    password = "Admin@123"

    register = client.post(
        "/auth/register",
        json={
            "full_name": "Admin User",
            "email": email,
            "password": password,
            "role": "Admin"
        }
    )

    assert register.status_code == 200

    login = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password
        }
    )

    assert login.status_code == 200

    return login.json()["access_token"]


def test_employee_crud():

    token = get_admin_token()

    headers = {
        "Authorization": f"Bearer {token}"
    }

    employee_data = {
        "employee_id": f"EMP-{uuid.uuid4().hex[:6]}",
        "full_name": "John Tester",
        "email": f"john_{uuid.uuid4().hex[:6]}@test.com",
        "phone": "9876543210",
        "department": "IT",
        "position": "Developer",
        "salary": 50000,
        "joining_date": str(date.today())
    }

    create = client.post(
        "/employees/",
        json=employee_data,
        headers=headers
    )

    print(create.json())

    assert create.status_code == 200