import os
import sys
from datetime import date

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal
from app.models.department import Department
from app.models.employee import Employee
from app.models.user import User
from app.utils.security import hash_password


def seed_database():
    db = SessionLocal()
    try:
        # 1. Seed Super Admin User Account
        admin_email = "admin@orvexa.ai"
        admin_user = db.query(User).filter(User.email == admin_email).first()

        if not admin_user:
            admin_user = User(
                full_name="System Administrator",
                email=admin_email,
                password=hash_password("Admin@Orvexa2026!"),
                role="Admin",
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"[+] Admin account created: {admin_email}")
        else:
            print(f"[*] Admin account already exists: {admin_email}")

        # 2. Seed Default Organizational Departments
        default_departments = [
            ("DEP-EXEC", "Executive"),
            ("DEP-HR", "Human Resources"),
            ("DEP-ENG", "Engineering"),
            ("DEP-SALES", "Sales & Marketing"),
            ("DEP-OPS", "Finance & Operations"),
        ]

        for code, name in default_departments:
            dept = (
                db.query(Department)
                .filter(Department.department_code == code)
                .first()
            )
            if not dept:
                db.add(
                    Department(
                        department_code=code,
                        department_name=name,
                        description=f"{name} Department",
                        status="Active",
                    )
                )
                print(f"[+] Department created: {name} ({code})")
        db.commit()

        # 3. Seed Admin Employee Profile
        admin_emp = (
            db.query(Employee)
            .filter(Employee.user_id == admin_user.id)
            .first()
        )
        if not admin_emp:
            admin_emp = Employee(
                employee_id="EMP-0001",
                full_name="System Administrator",
                email=admin_email,
                user_id=admin_user.id,
                department="Executive",
                position="System Administrator",
                salary=100000.0,
                joining_date=date.today(),
            )
            db.add(admin_emp)
            db.commit()
            print("[+] Admin employee profile linked.")

        print("\n[✓] Database seeding completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"[-] Seeding error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()