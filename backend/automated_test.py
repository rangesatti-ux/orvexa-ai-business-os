import requests
from datetime import date, timedelta

BASE = "http://127.0.0.1:8000"

print("\n========== ORVEXA FINAL CRUD TEST ==========\n")

# --------------------------------------------------
# LOGIN
# --------------------------------------------------
login = requests.post(
    BASE + "/auth/login",
    data={
        "username": "rangesatti@gmail.com",
        "password": "Naga@807"
    },
    timeout=10
)

if login.status_code != 200:
    print("FAIL   Login", login.status_code)
    print(login.text)
    raise SystemExit

print("PASS   Login")
headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

passed = 1
total = 1


def check(name, method, url, expected=None, **kwargs):
    global passed, total

    total += 1

    try:
        r = requests.request(
            method,
            BASE + url,
            headers=headers,
            timeout=10,
            **kwargs
        )
    except Exception as e:
        print(f"FAIL   {name:<35} ERROR: {e}")
        return None

    ok = (
        r.status_code == expected
        if expected is not None
        else 200 <= r.status_code < 300
    )

    print(f"{'PASS' if ok else 'FAIL':<6} {name:<35} {r.status_code}")

    if not ok:
        print("       ", r.text[:400])

    if ok:
        passed += 1

    return r


# --------------------------------------------------
# CREATE EMPLOYEE FIRST
# --------------------------------------------------
employee = {
    "employee_id": "TEST-EMP-999",
    "full_name": "Orvexa Test Employee",
    "email": "orvexa.test.employee@example.com",
    "phone": "9000099999",
    "department": "Testing",
    "position": "QA Tester",
    "salary": 25000,
    "joining_date": str(date.today())
}

r = check(
    "Employee CREATE",
    "POST",
    "/employees/",
    json=employee
)

employee_id = r.json().get("id") if r is not None and r.ok else None

if employee_id:

    check(
        "Employee GET",
        "GET",
        f"/employees/{employee_id}"
    )

    check(
        "Employee UPDATE",
        "PUT",
        f"/employees/{employee_id}",
        json={
            "full_name": "Orvexa Updated Employee",
            "email": "orvexa.updated.employee@example.com",
            "phone": "9000088888",
            "department": "Testing",
            "position": "Senior QA Tester",
            "salary": 30000,
            "status": "Active"
        }
    )


# --------------------------------------------------
# CREATE PRODUCT
# --------------------------------------------------
product = {
    "product_code": "TEST-PROD-999",
    "product_name": "Orvexa Test Product",
    "category": "Testing",
    "quantity": 20,
    "price": 999,
    "supplier": "Test Supplier"
}

r = check(
    "Product CREATE",
    "POST",
    "/products/",
    json=product
)

product_id = r.json().get("id") if r is not None and r.ok else None

if product_id:

    check(
        "Product GET",
        "GET",
        f"/products/{product_id}"
    )

    check(
        "Product UPDATE",
        "PUT",
        f"/products/{product_id}",
        json={
            "product_code": "TEST-PROD-999",
            "product_name": "Orvexa Updated Product",
            "category": "Testing",
            "quantity": 25,
            "price": 1099,
            "supplier": "Test Supplier"
        }
    )


# --------------------------------------------------
# CUSTOMER
# --------------------------------------------------
customer = {
    "customer_code": "TEST-CUST-999",
    "full_name": "Orvexa Test Customer",
    "phone": "9111199999",
    "email": "orvexa.test.customer@example.com",
    "address": "Test Address",
    "city": "Nagpur",
    "state": "Maharashtra",
    "pincode": "440001"
}

r = check(
    "Customer CREATE",
    "POST",
    "/customers/",
    json=customer
)

customer_id = r.json().get("id") if r is not None and r.ok else None

if customer_id:

    check(
        "Customer GET",
        "GET",
        f"/customers/{customer_id}"
    )

    check(
        "Customer UPDATE",
        "PUT",
        f"/customers/{customer_id}",
        json={
            "customer_code": "TEST-CUST-999",
            "full_name": "Orvexa Updated Customer",
            "phone": "9111188888",
            "email": "orvexa.updated.customer@example.com"
        }
    )

    check(
        "Customer DELETE",
        "DELETE",
        f"/customers/{customer_id}"
    )


# --------------------------------------------------
# SUPPLIER
# --------------------------------------------------
supplier = {
    "supplier_code": "TEST-SUP-999",
    "supplier_name": "Orvexa Test Supplier",
    "contact_person": "Test Contact",
    "phone": "9222299999",
    "email": "orvexa.test.supplier@example.com",
    "address": "Test Address",
    "city": "Nagpur",
    "state": "Maharashtra",
    "pincode": "440001",
    "gst_number": "27TEST9999T1Z9"
}

r = check(
    "Supplier CREATE",
    "POST",
    "/suppliers/",
    json=supplier
)

supplier_id = r.json().get("id") if r is not None and r.ok else None

if supplier_id:

    check(
        "Supplier GET",
        "GET",
        f"/suppliers/{supplier_id}"
    )

    check(
        "Supplier UPDATE",
        "PUT",
        f"/suppliers/{supplier_id}",
        json={
            "supplier_code": "TEST-SUP-999",
            "supplier_name": "Orvexa Updated Supplier",
            "phone": "9222288888",
            "is_active": True
        }
    )


# --------------------------------------------------
# SALE
# --------------------------------------------------
if product_id:

    sale = {
        "customer_name": "Orvexa Sale Test",
        "customer_phone": "9333399999",
        "customer_email": "orvexa.sale@example.com",
        "payment_method": "UPI",
        "discount": 0,
        "gst": 18,
        "items": [
            {
                "product_id": product_id,
                "quantity": 1
            }
        ]
    }

    r = check(
        "Sale CREATE",
        "POST",
        "/sales/",
        json=sale
    )

    sale_id = r.json().get("id") if r is not None and r.ok else None

    if sale_id:

        check(
            "Sale GET",
            "GET",
            f"/sales/{sale_id}"
        )


# --------------------------------------------------
# PURCHASE
# --------------------------------------------------
if supplier_id and product_id:

    purchase = {
        "supplier_id": supplier_id,
        "gst": 18,
        "discount": 0,
        "items": [
            {
                "product_id": product_id,
                "quantity": 1,
                "price": 999
            }
        ]
    }

    r = check(
        "Purchase CREATE",
        "POST",
        "/purchases/",
        json=purchase
    )

    purchase_id = r.json().get("id") if r is not None and r.ok else None

    if purchase_id:

        check(
            "Purchase GET",
            "GET",
            f"/purchases/{purchase_id}"
        )


# --------------------------------------------------
# ATTENDANCE
# --------------------------------------------------
if employee_id:

    check(
        "Attendance CHECK-IN",
        "POST",
        "/attendance/check-in",
        json={"employee_id": employee_id}
    )

    check(
        "Attendance CHECK-OUT",
        "POST",
        "/attendance/check-out",
        json={"employee_id": employee_id}
    )


# --------------------------------------------------
# LEAVE
# --------------------------------------------------
if employee_id:

    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=1)

    leave = {
        "employee_id": employee_id,
        "leave_type": "Casual",
        "start_date": str(start),
        "end_date": str(end),
        "reason": "Automated CRUD test"
    }

    r = check(
        "Leave CREATE",
        "POST",
        "/leaves/",
        json=leave
    )

    leave_id = r.json().get("id") if r is not None and r.ok else None

    if leave_id:

        check(
            "Leave STATUS UPDATE",
            "PUT",
            f"/leaves/{leave_id}/status",
            json={"status": "Approved"}
        )

        check(
            "Leave GET",
            "GET",
            f"/leaves/{leave_id}"
        )


# --------------------------------------------------
# PAYROLL
# --------------------------------------------------
if employee_id:

    payroll = {
        "employee_id": employee_id,
        "month": "2026-09",
        "basic_salary": 25000,
        "hra": 2000,
        "allowance": 1000,
        "bonus": 500,
        "deduction": 200
    }

    r = check(
        "Payroll CREATE",
        "POST",
        "/payroll/",
        json=payroll
    )

    payroll_id = r.json().get("id") if r is not None and r.ok else None


# --------------------------------------------------
# VALIDATION
# --------------------------------------------------
check(
    "Invalid Product Quantity",
    "POST",
    "/products/",
    expected=422,
    json={
        "product_code": "INVALID-999",
        "product_name": "Invalid Product",
        "category": "Testing",
        "quantity": -5,
        "price": 100,
        "supplier": "Test"
    }
)

check(
    "Invalid Payroll Salary",
    "POST",
    "/payroll/",
    expected=422,
    json={
        "employee_id": employee_id or 1,
        "month": "2026-09",
        "basic_salary": -1000
    }
)


# --------------------------------------------------
# CLEANUP
# --------------------------------------------------
if sale_id if "sale_id" in locals() else False:
    check(
        "Sale DELETE",
        "DELETE",
        f"/sales/{sale_id}"
    )

if purchase_id if "purchase_id" in locals() else False:
    check(
        "Purchase DELETE",
        "DELETE",
        f"/purchases/{purchase_id}"
    )

if leave_id if "leave_id" in locals() else False:
    check(
        "Leave DELETE",
        "DELETE",
        f"/leaves/{leave_id}"
    )

if payroll_id if "payroll_id" in locals() else False:
    check(
        "Payroll DELETE",
        "DELETE",
        f"/payroll/{payroll_id}"
    )

if product_id:
    check(
        "Product DELETE",
        "DELETE",
        f"/products/{product_id}"
    )

if supplier_id:
    check(
        "Supplier DELETE",
        "DELETE",
        f"/suppliers/{supplier_id}"
    )

if employee_id:
    check(
        "Employee DELETE",
        "DELETE",
        f"/employees/{employee_id}"
    )


print("\n====================================================")
print(f"RESULT: {passed}/{total} tests passed")
print("====================================================\n")