import { Pencil, Trash2 } from "lucide-react";

function TaskTable({ tasks, deleteTask, editTask }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
        Task List
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead className="bg-gray-100 dark:bg-slate-900">
            <tr>
              {["Task", "Employee", "Priority", "Due Date", "Status", "Actions"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-300"
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-gray-500 dark:text-slate-400"
                >
                  No tasks found.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/40"
                >
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </div>
                    {task.description && (
                      <p className="mt-1 max-w-xs truncate text-xs text-gray-500 dark:text-slate-400">
                        {task.description}
                      </p>
                    )}
                  </td>

                  <td className="p-4 text-gray-700 dark:text-slate-300">
                    {task.employee || "Unassigned"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        task.priority === "High"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td className="p-4 text-gray-700 dark:text-slate-300">
                    {task.due_date
                      ? String(task.due_date).slice(0, 10)
                      : "—"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        task.status === "Completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : task.status === "In Progress"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => editTask(task)}
                        title="Edit task"
                        className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                        className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
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

export default TaskTable;