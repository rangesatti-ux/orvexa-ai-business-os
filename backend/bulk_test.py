import getpass
import json
import sys
import urllib.error
import urllib.parse
import urllib.request


BASE_URL = "http://127.0.0.1:8000"


# ============================================================
# Helpers
# ============================================================

def request(method, path, token=None, data=None, form=False):
    url = BASE_URL + path

    headers = {
        "Accept": "application/json",
    }

    body = None

    if data is not None:
        if form:
            body = urllib.parse.urlencode(data).encode("utf-8")
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            body = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"

    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(
        url,
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            content = response.read()

            try:
                parsed = json.loads(content.decode("utf-8"))
            except Exception:
                parsed = None

            return response.status, parsed, content

    except urllib.error.HTTPError as e:
        content = e.read()

        try:
            parsed = json.loads(content.decode("utf-8"))
        except Exception:
            parsed = content.decode("utf-8", errors="ignore")

        return e.code, parsed, content

    except Exception as e:
        return 0, str(e), b""


def test(name, method, path, token=None, data=None, form=False):
    status, response, raw = request(
        method,
        path,
        token=token,
        data=data,
        form=form,
    )

    if 200 <= status < 300:
        print(f"✅ {name:<30} {status}")
        return True, response

    print(f"❌ {name:<30} {status}")
    print(f"   Response: {response}")

    return False, response


# ============================================================
# Login
# ============================================================

print()
print("=" * 70)
print("                 ORVEXA AI BUSINESS OS")
print("                    BULK API TEST")
print("=" * 70)
print()

email = input("Enter your login email: ").strip()
password = getpass.getpass("Enter your password: ")


print()
print("Logging in...")

status, login_response, _ = request(
    "POST",
    "/auth/login",
    data={
        "username": email,
        "password": password,
    },
    form=True,
)

if status != 200:
    print()
    print("❌ LOGIN FAILED")
    print("Status:", status)
    print("Response:", login_response)
    sys.exit(1)

token = login_response.get("access_token")

if not token:
    print("❌ Login succeeded but no access token was returned.")
    sys.exit(1)

print("✅ Login successful")
print()


# ============================================================
# Test counters
# ============================================================

passed = 0
failed = 0


def run(name, method, path, data=None, form=False):
    global passed, failed

    success, response = test(
        name,
        method,
        path,
        token=token,
        data=data,
        form=form,
    )

    if success:
        passed += 1
    else:
        failed += 1

    return response


# ============================================================
# Core
# ============================================================

print("=" * 70)
print("CORE")
print("=" * 70)

run("Health", "GET", "/health")
run("Dashboard Stats", "GET", "/dashboard/stats")


# ============================================================
# Employees
# ============================================================

print()
print("=" * 70)
print("EMPLOYEES")
print("=" * 70)

employees_response = run(
    "Employees",
    "GET",
    "/employees/?page=1&limit=10",
)


# ============================================================
# Attendance
# ============================================================

print()
print("=" * 70)
print("ATTENDANCE")
print("=" * 70)

run(
    "Attendance",
    "GET",
    "/attendance/?page=1&limit=10",
)


# ============================================================
# Leave
# ============================================================

print()
print("=" * 70)
print("LEAVE")
print("=" * 70)

run(
    "Leave Requests",
    "GET",
    "/leaves/",
)

run(
    "Leave Dashboard Stats",
    "GET",
    "/leaves/dashboard/stats",
)


# ============================================================
# Payroll
# ============================================================

print()
print("=" * 70)
print("PAYROLL")
print("=" * 70)

run(
    "Payroll",
    "GET",
    "/payroll/?page=1&limit=10",
)

run(
    "Payroll Dashboard Stats",
    "GET",
    "/payroll/dashboard/stats",
)


# ============================================================
# Inventory
# ============================================================

print()
print("=" * 70)
print("INVENTORY")
print("=" * 70)

products_response = run(
    "Products",
    "GET",
    "/products/?page=1&limit=10",
)

run(
    "Low Stock Products",
    "GET",
    "/products/low-stock/?page=1&limit=10",
)

run(
    "Sorted Products",
    "GET",
    "/products/sorted/?page=1&limit=10",
)


# ============================================================
# Sales
# ============================================================

print()
print("=" * 70)
print("SALES")
print("=" * 70)

run(
    "Sales",
    "GET",
    "/sales/?page=1&limit=10",
)

run(
    "Sales Dashboard Stats",
    "GET",
    "/sales/dashboard/stats",
)


# ============================================================
# Customers
# ============================================================

print()
print("=" * 70)
print("CUSTOMERS")
print("=" * 70)

run(
    "Customers",
    "GET",
    "/customers/?page=1&limit=10",
)


# ============================================================
# Suppliers
# ============================================================

print()
print("=" * 70)
print("SUPPLIERS")
print("=" * 70)

run(
    "Suppliers",
    "GET",
    "/suppliers/?page=1&limit=10",
)

run(
    "Supplier Dashboard Stats",
    "GET",
    "/suppliers/dashboard/stats",
)


# ============================================================
# Purchases
# ============================================================

print()
print("=" * 70)
print("PURCHASES")
print("=" * 70)

run(
    "Purchases",
    "GET",
    "/purchases/?page=1&limit=10",
)


# ============================================================
# Analytics
# ============================================================

print()
print("=" * 70)
print("ANALYTICS")
print("=" * 70)

run(
    "Analytics Dashboard",
    "GET",
    "/analytics/dashboard",
)


# ============================================================
# Reports
# ============================================================

print()
print("=" * 70)
print("REPORTS")
print("=" * 70)

run(
    "Employee PDF Report",
    "GET",
    "/reports/employees/pdf",
)

run(
    "Employee Excel Report",
    "GET",
    "/reports/employees/excel",
)

run(
    "Inventory PDF Report",
    "GET",
    "/reports/inventory/pdf",
)

run(
    "Sales PDF Report",
    "GET",
    "/reports/sales/pdf",
)

run(
    "Payroll PDF Report",
    "GET",
    "/reports/payroll/pdf",
)


# ============================================================
# Notifications
# ============================================================

print()
print("=" * 70)
print("NOTIFICATIONS")
print("=" * 70)

run(
    "Notifications",
    "GET",
    "/notifications/",
)


# ============================================================
# Audit Logs
# ============================================================

print()
print("=" * 70)
print("AUDIT LOGS")
print("=" * 70)

run(
    "Audit Logs",
    "GET",
    "/audit/",
)


# ============================================================
# AI Assistant
# ============================================================

print()
print("=" * 70)
print("AI ASSISTANT")
print("=" * 70)

ai_response = run(
    "AI Business Assistant",
    "POST",
    "/ai/chat",
    data={
        "message": "Give me a short summary of my business."
    },
)

if isinstance(ai_response, dict):
    if ai_response.get("response"):
        print("   AI response received successfully.")


# ============================================================
# Final Result
# ============================================================

total = passed + failed

print()
print("=" * 70)
print("                    TEST RESULT")
print("=" * 70)

print()
print(f"Total tests : {total}")
print(f"Passed      : {passed}")
print(f"Failed      : {failed}")

print()

if failed == 0:
    print("🎉 ALL BULK API TESTS PASSED!")
else:
    print("⚠️ SOME TESTS FAILED.")
    print("Check the ❌ entries above.")

print()
print("=" * 70)