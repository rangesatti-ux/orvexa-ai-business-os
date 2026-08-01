import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import ReportsPage from "./pages/reports/ReportsPage";
import Dashboard from "./pages/dashboard/Dashboard";
import EmployeePage from "./pages/employees/EmployeePage";
import AttendancePage from "./pages/attendance/AttendancePage";
import InventoryPage from "./pages/inventory/InventoryPage";
import PayrollPage from "./pages/payroll/PayrollPage";
import Settings from "./pages/Settings";
import AssistantPage from "./pages/assistant/AssistantPage";
import ProfilePage from "./pages/profile/ProfilePage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import LeavePage from "./pages/leave/LeavePage";
import DepartmentPage from "./pages/departments/DepartmentPage";
import TaskPage from "./pages/tasks/TaskPage";
function App() {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reports" element={<ReportsPage />} />
      

      {/* Dashboard Routes */}
      <Route
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/departments" element={<DepartmentPage />} />
        <Route path="/tasks" element={<TaskPage />} />
      </Route>
    </Routes>
  );
}

export default App;