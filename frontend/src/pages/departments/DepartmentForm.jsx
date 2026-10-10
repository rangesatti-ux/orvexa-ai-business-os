import { useEffect, useState } from "react";

function DepartmentForm({
  saveDepartment,
  editingDepartment,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    department_code: "",
    department_name: "",
    description: "",
    manager_name: "",
    status: "Active",
  });

  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        department_code:
          editingDepartment.department_code || "",
        department_name:
          editingDepartment.department_name || "",
        description:
          editingDepartment.description || "",
        manager_name:
          editingDepartment.manager_name || "",
        status:
          editingDepartment.status || "Active",
      });
    } else {
      setFormData({
        department_code: "",
        department_name: "",
        description: "",
        manager_name: "",
        status: "Active",
      });
    }
  }, [editingDepartment]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    saveDepartment(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {editingDepartment
            ? "Edit Department"
            : "Add Department"}
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          {editingDepartment
            ? "Update the department information."
            : "Create a new department."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Department Code
          </label>

          <input
            type="text"
            name="department_code"
            placeholder="e.g. IT"
            value={formData.department_code}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900"
            required
            disabled={Boolean(editingDepartment)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Department Name
          </label>

          <input
            type="text"
            name="department_name"
            placeholder="e.g. Information Technology"
            value={formData.department_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Manager Name
          </label>

          <input
            type="text"
            name="manager_name"
            placeholder="e.g. John Smith"
            value={formData.manager_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Description
          </label>

          <textarea
            name="description"
            placeholder="Enter department description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          {editingDepartment
            ? "Update Department"
            : "Add Department"}
        </button>

        {editingDepartment && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default DepartmentForm;