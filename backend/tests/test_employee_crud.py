import uuid
from datetime import date
from fastapi.testclient import TestClient

from main import app
from app.database.connection import get_db
from app.models.user import User
from app.utils.security import hash_password

client = TestClient(app)


def get_admin_token():
    """Seed an admin user directly into the DB session and return JWT token."""
    email = f"admin_{uuid.uuid4().hex[:8]}@test.com"
    password = "Admin@123"

    db = next(get_db())
    admin_user = User(
        full_name="Admin User",
        email=email,
        password=hash_password(password),
        role="Admin",
        is_active=True,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    login_res = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password,
        },
    )

    assert login_res.status_code == 200
    return login_res.json()["access_token"]


def test_employee_crud():
    token = get_admin_token()

    headers = {
        "Authorization": f"Bearer {token}",
    }

    employee_data = {
        "employee_id": f"EMP-{uuid.uuid4().hex[:6]}",
        "full_name": "John Tester",
        "email": f"john_{uuid.uuid4().hex[:6]}@test.com",
        "password": "Password123!",
        "role": "Employee",
        "phone": "9876543210",
        "department": "IT",
        "position": "Developer",
        "salary": 50000,
        "joining_date": str(date.today()),
    }

    create = client.post(
        "/employees/",
        json=employee_data,
        headers=headers,
    )

    assert create.status_code in (200, 201)
    res_data = create.json()
    assert res_data["employee_id"] == employee_data["employee_id"]
    assert res_data["full_name"] == employee_data["full_name"]