import uuid
from datetime import date
from fastapi.testclient import TestClient

from main import app
from app.database.connection import get_db
from app.models.employee import Employee
from app.models.user import User
from app.utils.security import hash_password, create_access_token

client = TestClient(app)


def seed_user_and_employee(role: str, full_name: str) -> tuple[User, Employee, str]:
    """Seed User and Employee directly into DB session and generate JWT token without hitting rate limits."""
    email = f"{role.lower()}_{uuid.uuid4().hex[:6]}@test.com"
    password = "Password123!"

    db = next(get_db())

    # 1. Create User with Titlecase role name
    user = User(
        full_name=full_name,
        email=email,
        password=hash_password(password),
        role=role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Create matching Employee profile
    employee = Employee(
        employee_id=f"EMP-{uuid.uuid4().hex[:6]}",
        full_name=full_name,
        email=email,
        user_id=user.id,
        department="Engineering",
        position=role,
        salary=60000.0,
        joining_date=date.today(),
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)

    # 3. Create Access Token directly
    token = create_access_token(
        data={
            "sub": user.email,
            "id": user.id,
            "role": user.role,
        }
    )

    return user, employee, token


def post_leave_request(emp_id: int, token: str):
    """Post leave request checking both /leave/ and /leaves/ endpoint prefixes."""
    payload = {
        "employee_id": emp_id,
        "leave_type": "Casual",
        "start_date": str(date.today()),
        "end_date": str(date.today()),
        "reason": "Personal work",
    }
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/leave/", json=payload, headers=headers)
    if res.status_code == 404:
        res = client.post("/leaves/", json=payload, headers=headers)
    return res


def put_leave_status(leave_id: int, status_val: str, token: str):
    """Put leave status checking both /leave/ and /leaves/ endpoint prefixes."""
    payload = {"status": status_val}
    headers = {"Authorization": f"Bearer {token}"}

    res = client.put(f"/leave/{leave_id}/status", json=payload, headers=headers)
    if res.status_code == 404:
        res = client.put(f"/leaves/{leave_id}/status", json=payload, headers=headers)
    return res


def test_rbac_leave_approval_permissions():
    """Verify Admin/HR can approve leaves while Employees cannot approve their own leaves."""
    _, admin_emp, admin_token = seed_user_and_employee("Admin", "Admin Tester")
    _, emp_emp, emp_token = seed_user_and_employee("Employee", "Employee Tester")

    # 1. Employee applies for leave
    leave_res = post_leave_request(emp_emp.id, emp_token)
    assert leave_res.status_code in (200, 201), f"Leave creation failed: {leave_res.text}"
    leave_id = leave_res.json()["id"]

    # 2. Employee tries to approve own leave (Forbidden)
    emp_approve = put_leave_status(leave_id, "Approved", emp_token)
    assert emp_approve.status_code == 403, f"Employee approval should fail: {emp_approve.text}"

    # 3. Admin approves leave (Success)
    admin_approve = put_leave_status(leave_id, "Approved", admin_token)
    assert admin_approve.status_code == 200, f"Admin approval failed ({admin_approve.status_code}): {admin_approve.text}"
    assert admin_approve.json()["status"] == "Approved"


def test_rbac_payroll_privacy():
    """Verify Employees cannot access payroll stats or administrative endpoints."""
    _, _, emp_token = seed_user_and_employee("Employee", "Employee Tester 2")

    # Employee attempts to view payroll dashboard stats (Forbidden)
    stats_res = client.get(
        "/payroll/dashboard/stats",
        headers={"Authorization": f"Bearer {emp_token}"},
    )
    assert stats_res.status_code == 403


def test_rbac_task_creation():
    """Verify Managers can create tasks while regular Employees cannot."""
    _, _, manager_token = seed_user_and_employee("Manager", "Manager Tester")
    _, _, emp_token = seed_user_and_employee("Employee", "Employee Tester 3")

    # 1. Employee attempts task creation (Forbidden)
    emp_task = client.post(
        "/tasks/",
        json={
            "title": "Unauthorized Task",
            "priority": "High",
            "status": "Pending",
        },
        headers={"Authorization": f"Bearer {emp_token}"},
    )
    assert emp_task.status_code == 403

    # 2. Manager creates task (Success)
    mgr_task = client.post(
        "/tasks/",
        json={
            "title": "Team Sprint Goal",
            "priority": "High",
            "status": "Pending",
        },
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert mgr_task.status_code in (200, 201), f"Task creation failed: {mgr_task.text}"
    assert mgr_task.json()["title"] == "Team Sprint Goal"