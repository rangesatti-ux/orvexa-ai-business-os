function EmployeesTable({
  employees,
  deleteEmployee,
  editEmployee,
}) {
  return (
    <div>
      <h2>Employees Table</h2>

      <table border="1" cellPadding="10" style={{ margin: "20px auto" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.email}</td>
              <td>
                <button
                  style={{ marginRight: "10px" }}
                  onClick={() => editEmployee(employee)}
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteEmployee(employee.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeesTable;