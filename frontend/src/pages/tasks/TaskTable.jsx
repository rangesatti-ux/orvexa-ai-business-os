import { Pencil, Trash2, FileDown, FileSpreadsheet } from "lucide-react";
import { exportToPDF } from "../../utils/exportPDF";
import { exportToExcel } from "../../utils/exportExcel";

function TaskTable({ tasks, deleteTask, editTask }) {
  const handleExportPDF = () => {
    exportToPDF(tasks, "Task Report");
  };

  const handleExportExcel = () => {
    exportToExcel(tasks, "Task_Report");
  };

  return (
    <div className="bg-white shadow rounded-xl p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Task List
        </h2>

        <div className="flex gap-3">

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            <FileDown size={18} />
            PDF
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>

        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-4 text-left">Task</th>
              <th className="p-4 text-left">Employee</th>
              <th className="p-4 text-left">Priority</th>
              <th className="p-4 text-left">Due Date</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>

          </thead>

          <tbody>

            {tasks.length === 0 ? (

              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-gray-500"
                >
                  No Tasks Found
                </td>
              </tr>

            ) : (

              tasks.map((task) => (

                <tr
                  key={task.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4">{task.title}</td>

                  <td className="p-4">{task.employee}</td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        task.priority === "High"
                          ? "bg-red-600"
                          : task.priority === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                    >
                      {task.priority}
                    </span>

                  </td>

                  <td className="p-4">
                    {task.dueDate}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        task.status === "Completed"
                          ? "bg-green-600"
                          : task.status === "In Progress"
                          ? "bg-blue-600"
                          : "bg-yellow-500"
                      }`}
                    >
                      {task.status}
                    </span>

                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() => editTask(task)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                      >
                        <Trash2 size={18} />
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