import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard/DashboardHome";
import EmployeePage from "./pages/employees/EmployeePage";
import Attendance from "./pages/Attendance";
import Inventory from "./pages/Inventory";
import Payroll from "./pages/Payroll";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeePage />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;