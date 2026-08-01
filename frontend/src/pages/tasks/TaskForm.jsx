import { useState, useEffect } from "react";

function TaskForm({ saveTask, editingTask }) {
  const [formData, setFormData] = useState({
    title: "",
    employee: "",
    priority: "Medium",
    dueDate: "",
    status: "Pending",
  });

  useEffect(() => {
    if (editingTask) {
      setFormData(editingTask);
    }
  }, [editingTask]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    saveTask(formData);

    setFormData({
      title: "",
      employee: "",
      priority: "Medium",
      dueDate: "",
      status: "Pending",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-6 mb-8"
    >
      <h2 className="text-2xl font-bold mb-6">
        {editingTask ? "Update Task" : "Add New Task"}
      </h2>

      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className="block mb-2 font-medium">
            Task Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter Task Title"
            className="w-full border rounded-lg p-3"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Employee
          </label>
          <input
            type="text"
            name="employee"
            value={formData.employee}
            onChange={handleChange}
            placeholder="Employee Name"
            className="w-full border rounded-lg p-3"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Priority
          </label>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Due Date
          </label>

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-2 font-medium">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

      </div>

      <button
        type="submit"
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
      >
        {editingTask ? "Update Task" : "Add Task"}
      </button>
    </form>
  );
}

export default TaskForm;