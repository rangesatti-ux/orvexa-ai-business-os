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

function App() {
  return (
    <Routes>

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Dashboard */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        {/* Everyone */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Admin + HR */}
        <Route
          path="/employees"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "hr"]}>
              <EmployeePage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/payroll"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "hr"]}>
              <PayrollPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "hr"]}>
              <ReportsPage />
            </RoleProtectedRoute>
          }
        />

        {/* Admin Only */}
        <Route
          path="/inventory"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <InventoryPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AnalyticsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <DepartmentPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/assistant"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AssistantPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <Settings />
            </RoleProtectedRoute>
          }
        />

        {/* Admin + Employee */}
        <Route
          path="/tasks"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "employee"]}>
              <TaskPage />
            </RoleProtectedRoute>
          }
        />

      </Route>

    </Routes>
  );
}

export default App;