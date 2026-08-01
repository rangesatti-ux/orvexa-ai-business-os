import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import EmployeeForm from "./EmployeeForm";
import EmployeesTable from "./EmployeesTable";

import exportEmployeesPDF from "../../utils/exportPDF";
import exportEmployeesExcel from "../../utils/exportExcel";

function EmployeePage() {
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

  const [search, setSearch] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "employees",
      JSON.stringify(employees)
    );
  }, [employees]);

  const saveEmployee = (employee) => {
    if (isEditing) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id
            ? { ...employee, id: editingEmployee.id }
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

  const deleteEmployee = (id) => {
    setEmployees((prev) =>
      prev.filter((emp) => emp.id !== id)
    );

    toast.error("Employee Deleted");
  };

  const editEmployee = (employee) => {
    setEditingEmployee(employee);
    setIsEditing(true);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Employee Management
      </h1>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-blue-500 text-white rounded-xl p-5">
          <h3>Total Employees</h3>
          <p className="text-3xl font-bold">
            {employees.length}
          </p>
        </div>

        <div className="bg-green-500 text-white rounded-xl p-5">
          <h3>Departments</h3>
          <p className="text-3xl font-bold">
            {[...new Set(employees.map((e) => e.department))].length}
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5">
          <h3>Designations</h3>
          <p className="text-3xl font-bold">
            {[...new Set(employees.map((e) => e.designation))].length}
          </p>
        </div>

        <div className="bg-red-500 text-white rounded-xl p-5">
          <h3>Search Results</h3>
          <p className="text-3xl font-bold">
            {filteredEmployees.length}
          </p>
        </div>

      </div>

      {/* Employee Form */}
      <EmployeeForm
        addEmployee={saveEmployee}
        editingEmployee={editingEmployee}
        isEditing={isEditing}
      />

      {/* Search */}
      <input
        type="text"
        placeholder="Search Employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"
      />

      {/* Export Buttons */}
      <div className="flex gap-4">

        <button
          onClick={() => exportEmployeesPDF(filteredEmployees)}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
        >
          📄 Export PDF
        </button>

        <button
          onClick={() => exportEmployeesExcel(filteredEmployees)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          📊 Export Excel
        </button>

      </div>

      {/* Employee Table */}
      <EmployeesTable
        employees={filteredEmployees}
        deleteEmployee={deleteEmployee}
        editEmployee={editEmployee}
      />

    </div>
  );
}

export default EmployeePage;