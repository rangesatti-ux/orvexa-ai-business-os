import { useEffect, useState } from "react";

function AttendanceForm({
  saveAttendance,
  editingAttendance,
  isEditing,
}) {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    date: "",
    status: "Present",
  });

  useEffect(() => {
    if (editingAttendance) {
      setFormData({
        name: editingAttendance.name,
        department: editingAttendance.department,
        date: editingAttendance.date,
        status: editingAttendance.status,
      });
    }
  }, [editingAttendance]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.department ||
      !formData.date
    ) {
      alert("Please fill all fields.");
      return;
    }

    saveAttendance(formData);

    setFormData({
      name: "",
      department: "",
      date: "",
      status: "Present",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Update Attendance" : "Mark Attendance"}
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="grid md:grid-cols-2 gap-5">

          <input
            type="text"
            name="name"
            placeholder="Employee Name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border rounded-lg p-3"
          >
            <option>Present</option>
            <option>Absent</option>
            <option>Leave</option>
            <option>Half Day</option>
          </select>

        </div>

        <button
          type="submit"
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          {isEditing ? "Update Attendance" : "Mark Attendance"}
        </button>

      </form>

    </div>
  );
}

export default AttendanceForm;