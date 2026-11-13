"""initial schema

Revision ID: 01c94eeffb5d
Revises: 
Create Date: 2026-09-15 11:46:49.503763

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '01c94eeffb5d'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='Admin'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index('ix_users_is_active', 'users', ['is_active'], unique=False)
    op.create_index('ix_users_role', 'users', ['role'], unique=False)

    # 2. Departments table
    op.create_table(
        'departments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('department_code', sa.String(length=50), nullable=False),
        sa.Column('department_name', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('manager_name', sa.String(length=150), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='Active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_departments_id', 'departments', ['id'], unique=False)
    op.create_index('ix_departments_department_code', 'departments', ['department_code'], unique=True)
    op.create_index('ix_departments_department_name', 'departments', ['department_name'], unique=False)
    op.create_index('ix_departments_code_name', 'departments', ['department_code', 'department_name'], unique=False)

    # 3. Employees table
    op.create_table(
        'employees',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('department_id', sa.Integer(), nullable=True),
        sa.Column('manager_id', sa.Integer(), nullable=True),
        sa.Column('employee_id', sa.String(length=50), nullable=True),
        sa.Column('full_name', sa.String(length=150), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('department', sa.String(), nullable=True),
        sa.Column('designation', sa.String(), nullable=True),
        sa.Column('position', sa.String(length=100), nullable=True),
        sa.Column('joining_date', sa.Date(), nullable=True),
        sa.Column('salary', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('status', sa.String(), nullable=False, server_default='Active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['manager_id'], ['employees.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_employees_employee_id', 'employees', ['employee_id'], unique=False)
    op.create_index('ix_employees_full_name', 'employees', ['full_name'], unique=False)
    op.create_index('ix_employees_email', 'employees', ['email'], unique=False)
    op.create_index('ix_employees_status', 'employees', ['status'], unique=False)
    op.create_index(op.f('ix_employees_id'), 'employees', ['id'], unique=False)
    op.create_index(op.f('ix_employees_user_id'), 'employees', ['user_id'], unique=True)
    op.create_index('ix_employees_department_id', 'employees', ['department_id'], unique=False)
    op.create_index('ix_employees_manager_id', 'employees', ['manager_id'], unique=False)

    # 4. Suppliers table
    op.create_table(
        'suppliers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('supplier_code', sa.String(length=50), nullable=True),
        sa.Column('supplier_name', sa.String(length=150), nullable=True),
        sa.Column('email', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('gst_number', sa.String(length=50), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_suppliers_supplier_code', 'suppliers', ['supplier_code'], unique=False)
    op.create_index('ix_suppliers_supplier_name', 'suppliers', ['supplier_name'], unique=False)
    op.create_index('ix_suppliers_email', 'suppliers', ['email'], unique=False)
    op.create_index(op.f('ix_suppliers_phone'), 'suppliers', ['phone'], unique=True)
    op.create_index('ix_suppliers_gst_number', 'suppliers', ['gst_number'], unique=False)

    # 5. Customers table
    op.create_table(
        'customers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_code', sa.String(length=50), nullable=True),
        sa.Column('full_name', sa.String(length=150), nullable=True),
        sa.Column('email', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_customers_customer_code'), 'customers', ['customer_code'], unique=True)
    op.create_index(op.f('ix_customers_full_name'), 'customers', ['full_name'], unique=False)
    op.create_index('ix_customers_email', 'customers', ['email'], unique=False)
    op.create_index(op.f('ix_customers_phone'), 'customers', ['phone'], unique=True)

    # 6. Products table
    op.create_table(
        'products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_code', sa.String(length=50), nullable=True),
        sa.Column('product_name', sa.String(length=150), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('price', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('cost_price', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('min_stock_level', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('supplier_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_products_product_code'), 'products', ['product_code'], unique=True)
    op.create_index(op.f('ix_products_product_name'), 'products', ['product_name'], unique=False)
    op.create_index(op.f('ix_products_category'), 'products', ['category'], unique=False)
    op.create_index(op.f('ix_products_supplier_id'), 'products', ['supplier_id'], unique=False)

    # 7. Tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('assigned_to_id', sa.Integer(), nullable=True),
        sa.Column('created_by_id', sa.Integer(), nullable=True),
        sa.Column('employee', sa.String(length=150), server_default='Unassigned', nullable=False),
        sa.Column('priority', sa.String(length=20), server_default='Medium', nullable=False),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=30), server_default='Pending', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['assigned_to_id'], ['employees.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_tasks_id', 'tasks', ['id'], unique=False)
    op.create_index('ix_tasks_title', 'tasks', ['title'], unique=False)
    op.create_index('ix_tasks_assigned_to_id', 'tasks', ['assigned_to_id'], unique=False)
    op.create_index(op.f('ix_tasks_created_by_id'), 'tasks', ['created_by_id'], unique=False)
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'], unique=False)
    op.create_index('ix_tasks_priority', 'tasks', ['priority'], unique=False)
    op.create_index('ix_tasks_status', 'tasks', ['status'], unique=False)

    # 8. Attendance table
    op.create_table(
        'attendance',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('attendance_date', sa.Date(), nullable=False),
        sa.Column('working_hours', sa.Float(), nullable=False, server_default='8.0'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='Present'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('employee_id', 'attendance_date', name='uq_attendance_employee_date')
    )
    op.create_index(op.f('ix_attendance_id'), 'attendance', ['id'], unique=False)
    op.create_index('ix_attendance_employee_date', 'attendance', ['employee_id', 'attendance_date'], unique=False)

    # 9. Leaves table
    op.create_table(
        'leaves',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('approved_by_id', sa.Integer(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='Pending'),
        sa.Column('rejection_reason', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['approved_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_leaves_id'), 'leaves', ['id'], unique=False)
    op.create_index('ix_leaves_employee_id', 'leaves', ['employee_id'], unique=False)
    op.create_index('ix_leaves_approved_by_id', 'leaves', ['approved_by_id'], unique=False)
    op.create_index('ix_leaves_start_date', 'leaves', ['start_date'], unique=False)
    op.create_index('ix_leaves_status', 'leaves', ['status'], unique=False)

    # 10. Payrolls table
    op.create_table(
        'payrolls',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('month', sa.String(length=20), nullable=True),
        sa.Column('status', sa.String(length=20), server_default=sa.text("'Pending'"), nullable=False),
        sa.Column('payment_date', sa.Date(), nullable=True),
        sa.Column('payment_method', sa.String(length=50), nullable=True),
        sa.Column('basic_salary', sa.Float(), nullable=True),
        sa.Column('hra', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('allowance', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('allowances', sa.Float(), nullable=True),
        sa.Column('bonus', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('deduction', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('deductions', sa.Float(), nullable=True),
        sa.Column('net_salary', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('employee_id', 'month', name='uq_payroll_employee_month')
    )
    op.create_index(op.f('ix_payrolls_id'), 'payrolls', ['id'], unique=False)
    op.create_index(op.f('ix_payrolls_employee_id'), 'payrolls', ['employee_id'], unique=False)
    op.create_index('ix_payrolls_employee_month', 'payrolls', ['employee_id', 'month'], unique=False)
    op.create_index('ix_payrolls_status', 'payrolls', ['status'], unique=False)

    # 11. Purchases table
    op.create_table(
        'purchases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('supplier_id', sa.Integer(), nullable=True),
        sa.Column('purchase_number', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=30), server_default=sa.text("'Received'"), nullable=False),
        sa.Column('payment_status', sa.String(length=30), server_default=sa.text("'Paid'"), nullable=False),
        sa.Column('payment_method', sa.String(length=50), nullable=True),
        sa.Column('subtotal', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('gst', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('discount', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('grand_total', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('invoice_date', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_purchases_purchase_number'), 'purchases', ['purchase_number'], unique=True)
    op.create_index(op.f('ix_purchases_supplier_id'), 'purchases', ['supplier_id'], unique=False)
    op.create_index('ix_purchases_status', 'purchases', ['status'], unique=False)
    op.create_index('ix_purchases_invoice_date', 'purchases', ['invoice_date'], unique=False)

    # 12. Purchase Items table
    op.create_table(
        'purchase_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('purchase_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['purchase_id'], ['purchases.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_purchase_items_purchase_id', 'purchase_items', ['purchase_id'], unique=False)
    op.create_index('ix_purchase_items_product_id', 'purchase_items', ['product_id'], unique=False)

    # 13. Sales table
    op.create_table(
        'sales',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=True),
        sa.Column('invoice_number', sa.String(length=50), nullable=True),
        sa.Column('subtotal', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('gst', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('discount', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('grand_total', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('payment_status', sa.String(length=20), nullable=False, server_default='Paid'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_sales_invoice_number', 'sales', ['invoice_number'], unique=False)
    op.create_index(op.f('ix_sales_customer_id'), 'sales', ['customer_id'], unique=False)
    op.create_index('ix_sales_payment_status', 'sales', ['payment_status'], unique=False)
    op.create_index('ix_sales_created_at', 'sales', ['created_at'], unique=False)

    # 14. Sale Items table
    op.create_table(
        'sale_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sale_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['sale_id'], ['sales.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_sale_items_sale_id', 'sale_items', ['sale_id'], unique=False)
    op.create_index(op.f('ix_sale_items_product_id'), 'sale_items', ['product_id'], unique=False)

    # 15. Audit Logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('username', sa.String(length=100), nullable=True),
        sa.Column('role', sa.String(length=50), nullable=True),
        sa.Column('module', sa.String(length=100), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=True),
        sa.Column('target_id', sa.String(length=100), nullable=True),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_user_id'), 'audit_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_username'), 'audit_logs', ['username'], unique=False)
    op.create_index(op.f('ix_audit_logs_module'), 'audit_logs', ['module'], unique=False)
    op.create_index('ix_audit_logs_module_action', 'audit_logs', ['module', 'action'], unique=False)
    op.create_index('ix_audit_logs_created_at', 'audit_logs', ['created_at'], unique=False)

    # 16. Notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('module', sa.String(length=100), nullable=True),
        sa.Column('type', sa.String(length=50), server_default=sa.text("'info'"), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('link', sa.String(length=255), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)
    op.create_index('ix_notifications_module', 'notifications', ['module'], unique=False)
    op.create_index(op.f('ix_notifications_is_read'), 'notifications', ['is_read'], unique=False)
    op.create_index('ix_notifications_created_at', 'notifications', ['created_at'], unique=False)
    op.create_index('ix_notifications_user_unread', 'notifications', ['user_id', 'is_read'], unique=False)


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('audit_logs')
    op.drop_table('sale_items')
    op.drop_table('sales')
    op.drop_table('purchase_items')
    op.drop_table('purchases')
    op.drop_table('payrolls')
    op.drop_table('leaves')
    op.drop_table('attendance')
    op.drop_table('tasks')
    op.drop_table('products')
    op.drop_table('customers')
    op.drop_table('suppliers')
    op.drop_table('employees')
    op.drop_table('departments')
    op.drop_table('users')