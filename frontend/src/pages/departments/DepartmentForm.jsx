import { useState, useEffect } from "react";

function DepartmentForm({ saveDepartment, editingDepartment }) {
  const [formData, setFormData] = useState({
    name: "",
    head: "",
    location: "",
    employees: "",
    status: "Active",
  });

  useEffect(() => {
    if (editingDepartment) {
      setFormData(editingDepartment);
    }
  }, [editingDepartment]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    saveDepartment(formData);

    setFormData({
      name: "",
      head: "",
      location: "",
      employees: "",
      status: "Active",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow rounded-xl p-6 mb-8"
    >
      <div className="grid md:grid-cols-2 gap-4">

        <input
          name="name"
          placeholder="Department Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-3 rounded-lg"
          required
        />

        <input
          name="head"
          placeholder="Department Head"
          value={formData.head}
          onChange={handleChange}
          className="border p-3 rounded-lg"
          required
        />

        <input
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="border p-3 rounded-lg"
          required
        />

        <input
          type="number"
          name="employees"
          placeholder="Employees"
          value={formData.employees}
          onChange={handleChange}
          className="border p-3 rounded-lg"
          required
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>

      </div>

      <button className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-lg">
        {editingDepartment ? "Update Department" : "Add Department"}
      </button>
    </form>
  );
}

export default DepartmentForm;