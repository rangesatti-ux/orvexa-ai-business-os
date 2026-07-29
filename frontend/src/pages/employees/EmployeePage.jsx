import { useState } from "react";
import { toast } from "react-toastify";

import EmployeeForm from "./EmployeeForm";
import EmployeesTable from "./EmployeesTable";

import { exportToPDF } from "../../utils/exportPDF";
import { exportToExcel } from "../../utils/exportExcel";

function EmployeePage() {
  const [employees, setEmployees] = useState([
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
  ]);

  const [search, setSearch] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const saveEmployee = (employee) => {
    if (isEditing) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id
            ? { ...employee, id: editingEmployee.id }
            : emp
        )
      );

      toast.success("Employee updated successfully!");

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

      toast.success("Employee added successfully!");
    }
  };

  const deleteEmployee = (id) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));

    toast.error("Employee deleted successfully!");
  };

  const editEmployee = (employee) => {
    setEditingEmployee(employee);
    setIsEditing(true);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Employee Management
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() =>
              exportToPDF(filteredEmployees, "Employees_Report")
            }
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            📄 Export PDF
          </button>

          <button
            onClick={() =>
              exportToExcel(filteredEmployees, "Employees_Report")
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            📊 Export Excel
          </button>

        </div>

      </div>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="bg-blue-600 text-white rounded-xl p-5 shadow">
          <p>Total Employees</p>
          <h2 className="text-3xl font-bold mt-2">
            {employees.length}
          </h2>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-5 shadow">
          <p>Departments</p>
          <h2 className="text-3xl font-bold mt-2">
            {[...new Set(employees.map((e) => e.department))].length}
          </h2>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5 shadow">
          <p>Designations</p>
          <h2 className="text-3xl font-bold mt-2">
            {[...new Set(employees.map((e) => e.designation))].length}
          </h2>
        </div>

        <div className="bg-purple-600 text-white rounded-xl p-5 shadow">
          <p>Search Results</p>
          <h2 className="text-3xl font-bold mt-2">
            {filteredEmployees.length}
          </h2>
        </div>

      </div>

      {/* Search */}

      <input
        type="text"
        placeholder="Search employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 border rounded-lg p-3"
      />

      {/* Form */}

      <EmployeeForm
        addEmployee={saveEmployee}
        editingEmployee={editingEmployee}
        isEditing={isEditing}
      />

      {/* Table */}

      <EmployeesTable
        employees={filteredEmployees}
        deleteEmployee={deleteEmployee}
        editEmployee={editEmployee}
      />

    </div>
  );
}

export default EmployeePage;