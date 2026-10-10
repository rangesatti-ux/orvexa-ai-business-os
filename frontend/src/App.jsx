import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import EmployeePage from "./pages/employees/EmployeePage";
import AttendancePage from "./pages/attendance/AttendancePage";
import PayrollPage from "./pages/payroll/PayrollPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import LeavePage from "./pages/leave/LeavePage";
import TaskPage from "./pages/tasks/TaskPage";
import ReportsPage from "./pages/reports/ReportsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import DepartmentPage from "./pages/departments/DepartmentPage";
import AssistantPage from "./pages/assistant/AssistantPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import Settings from "./pages/Settings";

// Business Pages
import SalesPage from "./pages/sales/SalesPage";
import CustomerPage from "./pages/customers/CustomerPage";
import SupplierPage from "./pages/suppliers/SupplierPage";
import PurchasePage from "./pages/purchases/PurchasePage";

function App() {
  return (
    <Routes>
      {/* =====================================================
          AUTH ROUTES
      ====================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* =====================================================
          PROTECTED APPLICATION ROUTES
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* =====================================================
            GENERAL ROUTES
        ====================================================== */}

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/attendance"
          element={<AttendancePage />}
        />

        <Route
          path="/leave"
          element={<LeavePage />}
        />

        <Route
          path="/profile"
          element={<ProfilePage />}
        />

        <Route
          path="/notifications"
          element={<NotificationsPage />}
        />

        {/* =====================================================
            EMPLOYEES
        ====================================================== */}

        <Route
          path="/employees"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin", "hr"]}
            >
              <EmployeePage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            PAYROLL
        ====================================================== */}

        <Route
          path="/payroll"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin", "hr"]}
            >
              <PayrollPage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            REPORTS
        ====================================================== */}

        <Route
          path="/reports"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin", "hr"]}
            >
              <ReportsPage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            INVENTORY
        ====================================================== */}

        <Route
          path="/inventory"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin"]}
            >
              <InventoryPage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            SALES
        ====================================================== */}

        <Route
          path="/sales"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin"]}
            >
              <SalesPage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            CUSTOMERS
        ====================================================== */}

        <Route
          path="/customers"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin"]}
            >
              <CustomerPage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            SUPPLIERS
        ====================================================== */}

        <Route
          path="/suppliers"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin"]}
            >
              <SupplierPage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            PURCHASES
        ====================================================== */}

        <Route
          path="/purchases"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin"]}
            >
              <PurchasePage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            DEPARTMENTS
        ====================================================== */}

        <Route
          path="/departments"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin"]}
            >
              <DepartmentPage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            ANALYTICS
        ====================================================== */}

        <Route
          path="/analytics"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin"]}
            >
              <AnalyticsPage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            AI ASSISTANT
        ====================================================== */}

        <Route
          path="/assistant"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin"]}
            >
              <AssistantPage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            TASKS
        ====================================================== */}

        <Route
          path="/tasks"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin", "employee"]}
            >
              <TaskPage />
            </RoleProtectedRoute>
          }
        />

        {/* =====================================================
            SETTINGS
        ====================================================== */}

        <Route
          path="/settings"
          element={
            <RoleProtectedRoute
              allowedRoles={["admin"]}
            >
              <Settings />
            </RoleProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;