import { useState } from "react";
import EmployeeForm from "./EmployeeForm";
import EmployeesTable from "./EmployeesTable";

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

  const addEmployee = (employee) => {
    setEmployees((prevEmployees) => [
      ...prevEmployees,
      {
        id: prevEmployees.length + 1,
        ...employee,
      },
    ]);
  };

  const deleteEmployee = (employeeId) => {
    setEmployees((prevEmployees) =>
      prevEmployees.filter((employee) => employee.id !== employeeId)
    );
  };

  const editEmployee = (employee) => {
    alert(`Editing ${employee.name} feature will be added soon.`);
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase()) ||
      employee.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Employee Management
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-gray-500">Total Employees</h3>
          <p className="text-3xl font-bold">{employees.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-gray-500">Active Employees</h3>
          <p className="text-3xl font-bold">{employees.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-gray-500">Search Results</h3>
          <p className="text-3xl font-bold">
            {filteredEmployees.length}
          </p>
        </div>
      </div>

      {/* Employee Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Add Employee
        </h2>

        <EmployeeForm addEmployee={addEmployee} />
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search Employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 border rounded-lg mb-6"
      />

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