import { useEffect, useState } from "react";

function AttendanceForm({
  saveAttendance,
  editingAttendance,
  isEditing,
  employees = [],
  loadingEmployees = false,
}) {
  const [formData, setFormData] = useState({
    employee_id: "",
    attendance_date: "",
    status: "Present",
    remarks: "",
  });

  useEffect(() => {
    if (editingAttendance) {
      setFormData({
        employee_id: editingAttendance.employee_id || "",
        attendance_date: editingAttendance.attendance_date || "",
        status: editingAttendance.status || "Present",
        remarks: editingAttendance.remarks || "",
      });
    } else {
      resetForm();
    }
  }, [editingAttendance]);

  const resetForm = () => {
    setFormData({
      employee_id: "",
      attendance_date: "",
      status: "Present",
      remarks: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.employee_id || !formData.attendance_date) {
      alert("Please select an employee and date.");
      return;
    }

    saveAttendance({
      ...formData,
      employee_id: Number(formData.employee_id),
    });

    if (!isEditing) {
      resetForm();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
        {isEditing ? "Update Attendance Record" : "Manual Attendance Override"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Employee
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              disabled={loadingEmployees || isEditing}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              required
            >
              <option value="">
                {loadingEmployees ? "Loading employees..." : "Select Employee"}
              </option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name || emp.name} (EMP #{emp.employee_id || emp.id})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              name="attendance_date"
              value={formData.attendance_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
              <option value="Half Day">Half Day</option>
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Remarks (Optional)
            </label>
            <input
              type="text"
              name="remarks"
              placeholder="e.g. Late check-in"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
          >
            {isEditing ? "Update Attendance" : "Save Attendance"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AttendanceForm;