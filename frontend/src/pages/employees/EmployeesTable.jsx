import { useAuth } from "../../context/AuthContext";

function EmployeesTable({
  employees,
  deleteEmployee,
  editEmployee,
}) {
  const { user } = useAuth();
  const userRole = user?.role ? user.role.toLowerCase() : "employee";
  
  // Per rules: Managers cannot edit or delete employees (Admin and HR only)
  const canManageEmployees = ["admin", "hr"].includes(userRole);

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300";
      case "hr":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300";
      case "manager":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300";
      default:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto transition-colors">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100 dark:bg-slate-700">
          <tr>
            <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">
              Employee ID
            </th>
            <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">
              Name
            </th>
            <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">
              Role
            </th>
            <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">
              Email
            </th>
            <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">
              Phone
            </th>
            <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">
              Department
            </th>
            <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">
              Designation
            </th>
            <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">
              Salary
            </th>
            <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">
              Joining Date
            </th>
            {canManageEmployees && (
              <th className="p-3 text-center text-gray-700 dark:text-gray-200 font-semibold">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors"
              >
                <td className="p-3 font-mono text-sm text-gray-800 dark:text-gray-200">
                  {employee.employee_id || employee.id}
                </td>

                <td className="p-3 font-medium text-gray-800 dark:text-white">
                  {employee.name || employee.full_name}
                </td>

                <td className="p-3">
                  <span
                    className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(
                      employee.role
                    )}`}
                  >
                    {employee.role || "Employee"}
                  </span>
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">
                  {employee.email}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">
                  {employee.phone}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">
                  {employee.department}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">
                  {employee.designation || employee.position}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300 text-sm font-medium">
                  ₹
                  {Number(employee.salary || 0).toLocaleString("en-IN")}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">
                  {employee.joining_date || "-"}
                </td>

                {canManageEmployees && (
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      {editEmployee && (
                        <button
                          onClick={() => editEmployee(employee)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm transition font-medium"
                        >
                          ✏️ Edit
                        </button>
                      )}

                      {deleteEmployee && (
                        <button
                          onClick={() => deleteEmployee(employee.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition font-medium"
                        >
                          🗑 Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={canManageEmployees ? "10" : "9"}
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