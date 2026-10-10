function EmployeesTable({
  employees,
  deleteEmployee,
  editEmployee,
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto transition-colors">

      <table className="min-w-full border-collapse">

        <thead className="bg-gray-100 dark:bg-slate-700">
          <tr>
            <th className="p-3 text-left text-gray-700 dark:text-gray-200">
              ID
            </th>

            <th className="p-3 text-left text-gray-700 dark:text-gray-200">
              Name
            </th>

            <th className="p-3 text-left text-gray-700 dark:text-gray-200">
              Email
            </th>

            <th className="p-3 text-left text-gray-700 dark:text-gray-200">
              Phone
            </th>

            <th className="p-3 text-left text-gray-700 dark:text-gray-200">
              Department
            </th>

            <th className="p-3 text-left text-gray-700 dark:text-gray-200">
              Designation
            </th>

            <th className="p-3 text-left text-gray-700 dark:text-gray-200">
              Salary
            </th>

            <th className="p-3 text-left text-gray-700 dark:text-gray-200">
              Joining Date
            </th>

            <th className="p-3 text-center text-gray-700 dark:text-gray-200">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <td className="p-3 text-gray-800 dark:text-gray-200">
                  {employee.id}
                </td>

                <td className="p-3 font-medium text-gray-800 dark:text-white">
                  {employee.name}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {employee.email}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {employee.phone}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {employee.department}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {employee.designation}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300">
                  ₹
                  {Number(
                    employee.salary || 0
                  ).toLocaleString("en-IN")}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {employee.joining_date ||
                    "-"}
                </td>

                <td className="p-3 text-center">
                  <div className="flex justify-center gap-2">

                    <button
                      onClick={() =>
                        editEmployee(
                          employee
                        )
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteEmployee(
                          employee.id
                        )
                      }
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
                colSpan="9"
                className="text-center p-10 text-gray-500 dark:text-gray-400"
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