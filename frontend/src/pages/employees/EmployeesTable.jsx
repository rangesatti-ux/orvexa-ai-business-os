function EmployeesTable({
  employees,
  deleteEmployee,
  editEmployee,
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Department</th>
            <th className="p-3 text-left">Designation</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3">{employee.id}</td>

                <td className="p-3 font-medium">
                  {employee.name}
                </td>

                <td className="p-3">
                  {employee.email}
                </td>

                <td className="p-3">
                  {employee.phone}
                </td>

                <td className="p-3">
                  {employee.department}
                </td>

                <td className="p-3">
                  {employee.designation}
                </td>

                <td className="p-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => editEmployee(employee)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => deleteEmployee(employee.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="text-center p-6 text-gray-500"
              >
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeesTable;