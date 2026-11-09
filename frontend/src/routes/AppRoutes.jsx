import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleProtectedRoute from "../components/RoleProtectedRoute";

import LandingPage from "../pages/landing/LandingPage";
import Dashboard from "../pages/dashboard/Dashboard";
import EmployeePage from "../pages/employees/EmployeePage";
import Attendance from "../pages/Attendance";
import Payroll from "../pages/Payroll";
import Inventory from "../pages/inventory";
import Settings from "../pages/Settings";
import Login from "../pages/auth/Login";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Authenticated routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Role-Restricted Admin & HR routes */}
        <Route
          path="/employees"
          element={
            <RoleProtectedRoute allowedRoles={["Admin", "HR", "Manager"]}>
              <EmployeePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <RoleProtectedRoute allowedRoles={["Admin", "HR", "Finance"]}>
              <Payroll />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <Inventory />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;