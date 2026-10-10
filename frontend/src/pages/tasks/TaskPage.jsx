import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../../services/api";
import TaskForm from "./TaskForm";
import TaskTable from "./TaskTable";
import { exportToPDF } from "../../utils/exportPDF";
import { exportToExcel } from "../../utils/exportExcel";

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tasks/");
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const saveTask = async (taskData) => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        title: taskData.title?.trim(),
        description: taskData.description || null,
        employee: taskData.employee?.trim() || "Unassigned",
        priority: taskData.priority || "Medium",
        due_date: taskData.due_date || taskData.dueDate || null,
        status: taskData.status || "Pending",
      };

      if (!payload.title) {
        toast.error("Task title is required.");
        return;
      }

      if (editingTask) {
        const response = await api.put(
          `/tasks/${editingTask.id}`,
          payload
        );

        setTasks((previous) =>
          previous.map((task) =>
            task.id === editingTask.id ? response.data : task
          )
        );

        setEditingTask(null);
        toast.success("Task updated successfully.");
      } else {
        const response = await api.post("/tasks/", payload);
        setTasks((previous) => [response.data, ...previous]);
        toast.success("Task created successfully.");
      }
    } catch (err) {
      const message =
        err.response?.data?.detail || "Failed to save task.";
      setError(typeof message === "string" ? message : "Please check task fields.");
      toast.error("Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await api.delete(`/tasks/${id}`);
      setTasks((previous) => previous.filter((task) => task.id !== id));

      if (editingTask?.id === id) setEditingTask(null);

      toast.success("Task deleted successfully.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete task.");
    }
  };

  const filteredTasks = tasks.filter((task) =>
    [
      task.title,
      task.employee,
      task.priority,
      task.status,
      task.description,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
  );

  const completed = tasks.filter((task) => task.status === "Completed").length;
  const inProgress = tasks.filter((task) => task.status === "In Progress").length;
  const pending = tasks.filter((task) => task.status === "Pending").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Task Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Create, assign, and track tasks.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportToPDF(filteredTasks, "Task_Report")}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Export PDF
          </button>
          <button
            onClick={() => exportToExcel(filteredTasks, "Task_Report")}
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Export Excel
          </button>
          <button
            onClick={loadTasks}
            disabled={loading}
            className="rounded-lg border px-4 py-2 dark:border-slate-600 dark:text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Tasks", value: tasks.length, color: "bg-blue-600" },
          { label: "Completed", value: completed, color: "bg-green-600" },
          { label: "In Progress", value: inProgress, color: "bg-yellow-500" },
          { label: "Pending", value: pending, color: "bg-red-600" },
        ].map((card) => (
          <div key={card.label} className={`${card.color} rounded-xl p-5 text-white shadow`}>
            <p>{card.label}</p>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full rounded-lg border bg-white p-3 text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white md:w-96"
      />

      <TaskForm
        saveTask={saveTask}
        editingTask={editingTask}
        isEditing={Boolean(editingTask)}
      />

      {saving && (
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Saving task...
        </p>
      )}

      {loading ? (
        <p className="rounded-xl bg-white p-8 text-center dark:bg-slate-800 dark:text-white">
          Loading tasks...
        </p>
      ) : (
        <TaskTable
          tasks={filteredTasks}
          deleteTask={deleteTask}
          editTask={setEditingTask}
        />
      )}
    </div>
  );
}

export default TaskPage;