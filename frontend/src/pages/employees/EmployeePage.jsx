import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import api from "../../services/api";
import EmployeeForm from "./EmployeeForm";
import EmployeesTable from "./EmployeesTable";
import { exportToPDF } from "../../utils/exportPDF";
import { exportToExcel } from "../../utils/exportExcel";
import { useAuth } from "../../context/AuthContext";

function EmployeePage() {
  const { user } = useAuth();
  const userRole = user?.role ? user.role.toLowerCase() : "employee";
  
  // Per rules: Managers do not have permission to add/create new employees (Admin & HR only)
  const canManageEmployees = ["admin", "hr"].includes(userRole);

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load employees from backend
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/employees/", {
        params: { page: 1, limit: 100 },
      });

      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.employees)) {
        data = response.data.employees;
      } else if (Array.isArray(response.data?.items)) {
        data = response.data.items;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      }

      const formattedEmployees = data.map((employee) => ({
        id: employee.id,
        employee_id: employee.employee_id || "",
        name: employee.full_name || employee.name || "",
        full_name: employee.full_name || employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        designation: employee.position || employee.designation || "",
        position: employee.position || employee.designation || "",
        role: employee.role || "Employee",
        salary: employee.salary ?? 0,
        joining_date: employee.joining_date || "",
        status: employee.status || "active",
      }));

      setEmployees(formattedEmployees);
    } catch (err) {
      console.error("Failed to load employees:", err);
      setError("Unable to load employees from the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Save (Create or Update) employee
  const saveEmployee = async (employee) => {
    if (!canManageEmployees) {
      toast.error("Unauthorized: Managers cannot add or modify employees.");
      return;
    }

    try {
      if (isEditing && editingEmployee) {
        const updatePayload = {
          full_name: employee.name?.trim() || employee.full_name?.trim(),
          email: employee.email?.trim(),
          phone: employee.phone?.trim(),
          department: employee.department?.trim(),
          position: employee.designation?.trim() || employee.position?.trim(),
          role: employee.role || "Employee",
          salary: Number(employee.salary) || 0,
          status: editingEmployee.status || "active",
        };

        await api.put(`/employees/${editingEmployee.id}`, updatePayload);
        toast.success("Employee updated successfully.");
      } else {
        const createPayload = {
          employee_id: employee.employee_id?.trim(),
          full_name: employee.name?.trim() || employee.full_name?.trim(),
          email: employee.email?.trim(),
          password: employee.password,
          phone: employee.phone?.trim(),
          department: employee.department?.trim(),
          position: employee.designation?.trim() || employee.position?.trim(),
          role: employee.role || "Employee",
          salary: Number(employee.salary) || 0,
          joining_date: employee.joining_date,
        };

        await api.post("/employees/", createPayload);
        toast.success("Employee added successfully.");
      }

      setEditingEmployee(null);
      setIsEditing(false);
      await fetchEmployees();
    } catch (err) {
      console.error("Failed to save employee:", err);
      const detail = err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        toast.error(
          detail.map((item) => item?.msg || "Invalid detail").join(", ")
        );
      } else if (typeof detail === "string") {
        toast.error(detail);
      } else {
        toast.error("Failed to save employee. Please check input values.");
      }
    }
  };

  // Delete an employee
  const deleteEmployee = async (id) => {
    if (!canManageEmployees) {
      toast.error("Unauthorized: Managers cannot delete employees.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/employees/${id}`);
      setEmployees((previous) =>
        previous.filter((employee) => employee.id !== id)
      );
      toast.success("Employee deleted successfully.");
    } catch (err) {
      console.error("Failed to delete employee:", err);
      const message = err?.response?.data?.detail || "Failed to delete employee.";
      toast.error(typeof message === "string" ? message : "Unable to delete employee.");
    }
  };

  // Set up employee editing
  const editEmployee = (employee) => {
    if (!canManageEmployees) {
      toast.error("Unauthorized: Managers cannot edit employees.");
      return;
    }
    setEditingEmployee(employee);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Search filter
  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee.name,
        employee.full_name,
        employee.email,
        employee.phone,
        employee.department,
        employee.designation,
        employee.employee_id,
        employee.role,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [employees, search]);

  const departmentCount = new Set(
    employees.map((employee) => employee.department).filter(Boolean)
  ).size;

  const designationCount = new Set(
    employees.map((employee) => employee.designation).filter(Boolean)
  ).size;

  // Exports
  const handleExportPDF = () => {
    if (filteredEmployees.length === 0) {
      toast.warning("No employees to export.");
      return;
    }
    exportToPDF(filteredEmployees, "Employees");
    toast.success("Employees exported to PDF.");
  };

  const handleExportExcel = () => {
    if (filteredEmployees.length === 0) {
      toast.warning("No employees to export.");
      return;
    }
    exportToExcel(filteredEmployees, "Employees");
    toast.success("Employees exported to Excel.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Employee Management
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {canManageEmployees
            ? "Manage workforce accounts directly synced with the Orvexa backend."
            : "View organizational team roster and directory."}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
          <button
            type="button"
            onClick={fetchEmployees}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-blue-500 p-5 text-white shadow">
          <h3 className="text-sm opacity-90">Total Employees</h3>
          <p className="mt-2 text-3xl font-bold">
            {loading ? "..." : employees.length}
          </p>
        </div>

        <div className="rounded-xl bg-green-500 p-5 text-white shadow">
          <h3 className="text-sm opacity-90">Departments</h3>
          <p className="mt-2 text-3xl font-bold">
            {loading ? "..." : departmentCount}
          </p>
        </div>

        <div className="rounded-xl bg-yellow-500 p-5 text-white shadow">
          <h3 className="text-sm opacity-90">Designations</h3>
          <p className="mt-2 text-3xl font-bold">
            {loading ? "..." : designationCount}
          </p>
        </div>

        <div className="rounded-xl bg-red-500 p-5 text-white shadow">
          <h3 className="text-sm opacity-90">Search Results</h3>
          <p className="mt-2 text-3xl font-bold">
            {loading ? "..." : filteredEmployees.length}
          </p>
        </div>
      </div>

      {/* Conditional Rendering: EmployeeForm is restricted to Admin & HR */}
      {canManageEmployees ? (
        <EmployeeForm
          addEmployee={saveEmployee}
          editingEmployee={editingEmployee}
          isEditing={isEditing}
        />
      ) : (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
          ℹ️ Employee creation and modification are restricted to Administrators and HR personnel. You can view the company employee directory below.
        </div>
      )}

      <div>
        <input
          type="text"
          placeholder="Search by name, email, phone, department, designation or employee ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={handleExportPDF}
          disabled={filteredEmployees.length === 0}
          className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          📄 Export PDF
        </button>

        <button
          type="button"
          onClick={handleExportExcel}
          disabled={filteredEmployees.length === 0}
          className="rounded-lg bg-green-600 px-5 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          📊 Export Excel
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow dark:bg-slate-800 dark:text-gray-400">
          Loading employees...
        </div>
      ) : (
        <EmployeesTable
          employees={filteredEmployees}
          deleteEmployee={canManageEmployees ? deleteEmployee : undefined}
          editEmployee={canManageEmployees ? editEmployee : undefined}
        />
      )}
    </div>
  );
}

export default EmployeePage;