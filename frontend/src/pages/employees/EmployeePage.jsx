import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import EmployeeForm from "./EmployeeForm";
import EmployeesTable from "./EmployeesTable";

import { exportToPDF } from "../../utils/exportPDF";
import { exportToExcel } from "../../utils/exportExcel";

function EmployeePage() {
  // ==============================
  // Employees State
  // ==============================
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("employees");

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            phone: "9876543210",
            department: "IT",
            designation: "Software Engineer",
          },
          {
            id: 2,
            name: "Alice",
            email: "alice@example.com",
            phone: "9123456780",
            department: "HR",
            designation: "HR Manager",
          },
        ];
  });

  // ==============================
  // Other States
  // ==============================
  const [search, setSearch] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // ==============================
  // Save Employees to LocalStorage
  // ==============================
  useEffect(() => {
    localStorage.setItem(
      "employees",
      JSON.stringify(employees)
    );
  }, [employees]);

  // ==============================
  // Add / Update Employee
  // ==============================
  const saveEmployee = (employee) => {
    if (isEditing && editingEmployee) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id
            ? {
                ...employee,
                id: editingEmployee.id,
              }
            : emp
        )
      );

      toast.success("Employee Updated Successfully");

      setEditingEmployee(null);
      setIsEditing(false);
    } else {
      setEmployees((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...employee,
        },
      ]);

      toast.success("Employee Added Successfully");
    }
  };

  // ==============================
  // Delete Employee
  // ==============================
  const deleteEmployee = (id) => {
    setEmployees((prev) =>
      prev.filter((employee) => employee.id !== id)
    );

    toast.error("Employee Deleted");
  };

  // ==============================
  // Edit Employee
  // ==============================
  const editEmployee = (employee) => {
    setEditingEmployee(employee);
    setIsEditing(true);
  };

  // ==============================
  // Search Employees
  // ==============================
  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase();

    return (
      employee.name?.toLowerCase().includes(searchText) ||
      employee.email?.toLowerCase().includes(searchText) ||
      employee.department?.toLowerCase().includes(searchText) ||
      employee.designation?.toLowerCase().includes(searchText)
    );
  });

  // ==============================
  // Export PDF
  // ==============================
  const handleExportPDF = () => {
    if (filteredEmployees.length === 0) {
      toast.warning("No employees to export");
      return;
    }

    exportToPDF(filteredEmployees, "Employees");

    toast.success("Employees Exported to PDF");
  };

  // ==============================
  // Export Excel
  // ==============================
  const handleExportExcel = () => {
    if (filteredEmployees.length === 0) {
      toast.warning("No employees to export");
      return;
    }

    exportToExcel(filteredEmployees, "Employees");

    toast.success("Employees Exported to Excel");
  };

  // ==============================
  // UI
  // ==============================
  return (
    <div className="space-y-6">

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Employee Management
      </h1>

      {/* ==============================
          Dashboard Cards
      ============================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Total Employees */}
        <div className="bg-blue-500 text-white rounded-xl p-5 shadow">
          <h3 className="font-medium">
            Total Employees
          </h3>

          <p className="text-3xl font-bold mt-2">
            {employees.length}
          </p>
        </div>

        {/* Departments */}
        <div className="bg-green-500 text-white rounded-xl p-5 shadow">
          <h3 className="font-medium">
            Departments
          </h3>

          <p className="text-3xl font-bold mt-2">
            {
              [
                ...new Set(
                  employees.map(
                    (employee) => employee.department
                  )
                ),
              ].length
            }
          </p>
        </div>

        {/* Designations */}
        <div className="bg-yellow-500 text-white rounded-xl p-5 shadow">
          <h3 className="font-medium">
            Designations
          </h3>

          <p className="text-3xl font-bold mt-2">
            {
              [
                ...new Set(
                  employees.map(
                    (employee) => employee.designation
                  )
                ),
              ].length
            }
          </p>
        </div>

        {/* Search Results */}
        <div className="bg-red-500 text-white rounded-xl p-5 shadow">
          <h3 className="font-medium">
            Search Results
          </h3>

          <p className="text-3xl font-bold mt-2">
            {filteredEmployees.length}
          </p>
        </div>

      </div>

      {/* ==============================
          Employee Form
      ============================== */}
      <EmployeeForm
        addEmployee={saveEmployee}
        editingEmployee={editingEmployee}
        isEditing={isEditing}
      />

      {/* ==============================
          Search
      ============================== */}
      <input
        type="text"
        placeholder="Search Employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          w-full
          border
          rounded-lg
          p-3
          bg-white
          text-gray-800
          border-gray-300
          outline-none
          focus:ring-2
          focus:ring-blue-500
          dark:bg-slate-800
          dark:text-white
          dark:border-slate-700
          dark:placeholder-gray-400
        "
      />

      {/* ==============================
          Export Buttons
      ============================== */}
      <div className="flex flex-wrap gap-4">

        {/* PDF Button */}
        <button
          onClick={handleExportPDF}
          className="
            bg-red-600
            hover:bg-red-700
            text-white
            px-5
            py-2
            rounded-lg
            transition
          "
        >
          📄 Export PDF
        </button>

        {/* Excel Button */}
        <button
          onClick={handleExportExcel}
          className="
            bg-green-600
            hover:bg-green-700
            text-white
            px-5
            py-2
            rounded-lg
            transition
          "
        >
          📊 Export Excel
        </button>

      </div>

      {/* ==============================
          Employee Table
      ============================== */}
      <EmployeesTable
        employees={filteredEmployees}
        deleteEmployee={deleteEmployee}
        editEmployee={editEmployee}
      />

    </div>
  );
}

export default EmployeePage;