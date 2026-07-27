import { useState } from "react";
import EmployeeForm from "./EmployeeForm";
import EmployeesTable from "./EmployeesTable";

function EmployeePage() {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    },
    {
      id: 2,
      name: "Alice",
      email: "alice@example.com",
    },
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const addEmployee = (employee) => {
    setEmployees([
      ...employees,
      {
        id: employees.length + 1,
        ...employee,
      },
    ]);
  };

  const deleteEmployee = (employeeId) => {
    setEmployees(
      employees.filter((employee) => employee.id !== employeeId)
    );
  };

  const editEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Employee Management</h1>

      <EmployeeForm
        addEmployee={addEmployee}
        selectedEmployee={selectedEmployee}
      />

      <br />

      <EmployeesTable
        employees={employees}
        deleteEmployee={deleteEmployee}
        editEmployee={editEmployee}
      />
    </div>
  );
}

export default EmployeePage;