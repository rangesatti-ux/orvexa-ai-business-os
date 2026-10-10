import { useEffect, useState } from "react";

const initialForm = {
  title: "",
  description: "",
  employee: "",
  priority: "Medium",
  dueDate: "",
  status: "Pending",
};

function TaskForm({ saveTask, editingTask, isEditing }) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || "",
        description: editingTask.description || "",
        employee: editingTask.employee || "",
        priority: editingTask.priority || "Medium",
        dueDate: (
          editingTask.due_date ||
          editingTask.dueDate ||
          ""
        ).slice(0, 10),
        status: editingTask.status || "Pending",
      });
    } else {
      setFormData(initialForm);
    }
  }, [editingTask]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await saveTask(formData);

    if (result !== false) {
      setFormData(initialForm);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
        {isEditing || editingTask ? "Update Task" : "Add New Task"}
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium text-gray-700 dark:text-slate-300">
            Task Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            maxLength={200}
            className="w-full rounded-lg border p-3 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700 dark:text-slate-300">
            Employee
          </label>
          <input
            type="text"
            name="employee"
            value={formData.employee}
            onChange={handleChange}
            placeholder="Employee name"
            className="w-full rounded-lg border p-3 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700 dark:text-slate-300">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700 dark:text-slate-300">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block font-medium text-gray-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the task (optional)"
            rows={3}
            className="w-full rounded-lg border p-3 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block font-medium text-gray-700 dark:text-slate-300">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
        >
          {isEditing || editingTask ? "Update Task" : "Add Task"}
        </button>

        {editingTask && (
          <button
            type="button"
            onClick={() => setFormData(initialForm)}
            className="rounded-lg border px-6 py-3 text-gray-700 dark:border-slate-600 dark:text-white"
          >
            Reset Form
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;