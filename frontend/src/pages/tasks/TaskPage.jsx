import { useState } from "react";
import { toast } from "react-toastify";

import TaskForm from "./TaskForm";
import TaskTable from "./TaskTable";

import { exportToPDF } from "../../utils/exportPDF";
import { exportToExcel } from "../../utils/exportExcel";

function TaskPage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Design Dashboard",
      employee: "John Doe",
      priority: "High",
      dueDate: "2026-08-05",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Prepare Payroll",
      employee: "Alice",
      priority: "Medium",
      dueDate: "2026-08-08",
      status: "Pending",
    },
  ]);

  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const saveTask = (task) => {
    if (isEditing) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...task, id: editingTask.id }
            : t
        )
      );

      toast.success("Task updated successfully!");

      setEditingTask(null);
      setIsEditing(false);
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...task,
        },
      ]);

      toast.success("Task added successfully!");
    }
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));

    toast.error("Task deleted successfully!");
  };

  const editTask = (task) => {
    setEditingTask(task);
    setIsEditing(true);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.employee.toLowerCase().includes(search.toLowerCase()) ||
      task.priority.toLowerCase().includes(search.toLowerCase()) ||
      task.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Task Management
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() =>
              exportToPDF(filteredTasks, "Task_Report")
            }
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            📄 Export PDF
          </button>

          <button
            onClick={() =>
              exportToExcel(filteredTasks, "Task_Report")
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            📊 Export Excel
          </button>

        </div>

      </div>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="bg-blue-600 text-white rounded-xl p-5 shadow">
          <p>Total Tasks</p>
          <h2 className="text-3xl font-bold mt-2">
            {tasks.length}
          </h2>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-5 shadow">
          <p>Completed</p>
          <h2 className="text-3xl font-bold mt-2">
            {tasks.filter((t) => t.status === "Completed").length}
          </h2>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5 shadow">
          <p>In Progress</p>
          <h2 className="text-3xl font-bold mt-2">
            {tasks.filter((t) => t.status === "In Progress").length}
          </h2>
        </div>

        <div className="bg-red-600 text-white rounded-xl p-5 shadow">
          <p>Pending</p>
          <h2 className="text-3xl font-bold mt-2">
            {tasks.filter((t) => t.status === "Pending").length}
          </h2>
        </div>

      </div>

      {/* Search */}

      <input
        type="text"
        placeholder="Search task..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 border rounded-lg p-3"
      />

      {/* Task Form */}

      <TaskForm
        saveTask={saveTask}
        editingTask={editingTask}
        isEditing={isEditing}
      />

      {/* Task Table */}

      <TaskTable
        tasks={filteredTasks}
        deleteTask={deleteTask}
        editTask={editTask}
      />

    </div>
  );
}

export default TaskPage;