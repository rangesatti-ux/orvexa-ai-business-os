import { useEffect, useState } from "react";

function LeaveForm({
  saveLeave,
  editingLeave,
  isEditing,
}) {
  const [formData, setFormData] = useState({
    employee: "",
    type: "Sick Leave",
    from: "",
    to: "",
    reason: "",
    status: "Pending",
  });

  useEffect(() => {
    if (editingLeave) {
      setFormData({
        employee: editingLeave.employee,
        type: editingLeave.type,
        from: editingLeave.from,
        to: editingLeave.to,
        reason: editingLeave.reason,
        status: editingLeave.status,
      });
    }
  }, [editingLeave]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.employee ||
      !formData.from ||
      !formData.to
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (formData.from > formData.to) {
      alert("From Date cannot be later than To Date.");
      return;
    }

    saveLeave(formData);

    setFormData({
      employee: "",
      type: "Sick Leave",
      from: "",
      to: "",
      reason: "",
      status: "Pending",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Update Leave" : "Apply Leave"}
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="grid md:grid-cols-2 gap-5">

          <input
            type="text"
            name="employee"
            placeholder="Employee Name"
            value={formData.employee}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="border rounded-lg p-3"
          >
            <option>Sick Leave</option>
            <option>Casual Leave</option>
            <option>Annual Leave</option>
            <option>Work From Home</option>
          </select>

          <input
            type="date"
            name="from"
            value={formData.from}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="date"
            name="to"
            value={formData.to}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <textarea
            name="reason"
            rows="3"
            placeholder="Reason"
            value={formData.reason}
            onChange={handleChange}
            className="border rounded-lg p-3 md:col-span-2"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border rounded-lg p-3"
          >
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>

        </div>

        <button
          type="submit"
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          {isEditing ? "Update Leave" : "Apply Leave"}
        </button>

      </form>

    </div>
  );
}

export default LeaveForm;