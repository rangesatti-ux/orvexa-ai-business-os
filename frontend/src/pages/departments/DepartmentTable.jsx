import { Pencil, Trash2 } from "lucide-react";

function DepartmentTable({
  departments,
  deleteDepartment,
  editDepartment,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-100 dark:bg-slate-900">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">
                Code
              </th>

              <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">
                Department
              </th>

              <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">
                Manager
              </th>

              <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">
                Description
              </th>

              <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">
                Status
              </th>

              <th className="p-4 text-center text-sm font-semibold text-gray-700 dark:text-slate-300">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-gray-500 dark:text-slate-400"
                >
                  No departments found.
                </td>
              </tr>
            ) : (
              departments.map((department) => (
                <tr
                  key={department.id}
                  className="border-t border-gray-200 transition hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/40"
                >
                  <td className="p-4">
                    <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 dark:bg-slate-700 dark:text-slate-200">
                      {department.department_code}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {department.department_name}
                    </div>
                  </td>

                  <td className="p-4 text-gray-700 dark:text-slate-300">
                    {department.manager_name || "Not assigned"}
                  </td>

                  <td className="max-w-xs p-4 text-sm text-gray-600 dark:text-slate-400">
                    <div
                      className="truncate"
                      title={
                        department.description || ""
                      }
                    >
                      {department.description ||
                        "No description"}
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        department.status?.toLowerCase() ===
                        "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {department.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          editDepartment(department)
                        }
                        title="Edit department"
                        className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteDepartment(department.id)
                        }
                        title="Delete department"
                        className="rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DepartmentTable;