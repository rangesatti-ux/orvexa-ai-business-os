import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert } from "lucide-react";

function AttendanceForm({
  saveAttendance,
  editingAttendance,
  isEditing,
  employees = [],
  loadingEmployees = false,
}) {
  const { user } = useAuth();
  const userRole = user?.role ? user.role.toLowerCase() : "employee";

  const isAdmin = userRole === "admin";
  const isEmployee = userRole === "employee";
  const isHr = userRole === "hr";
  const isPersonalOnly = isEmployee || isHr;

  const targetEmployeeId = user?.employee_id || user?.id;

  const [formData, setFormData] = useState({
    employee_id: "",
    attendance_date: "",
    status: "Present",
    remarks: "",
  });

  useEffect(() => {
    if (isAdmin) return;

    if (editingAttendance) {
      setFormData({
        employee_id: editingAttendance.employee_id || "",
        attendance_date: editingAttendance.attendance_date || editingAttendance.date || "",
        status: editingAttendance.status || "Present",
        remarks: editingAttendance.remarks || "",
      });
    } else if (isPersonalOnly && employees.length > 0) {
      const matchingEmp = employees.find(
        (emp) =>
          Number(emp.id) === Number(targetEmployeeId) ||
          Number(emp.user_id) === Number(user?.id) ||
          (emp.email && user?.email && emp.email.toLowerCase() === user.email.toLowerCase()) ||
          (emp.full_name && user?.name && emp.full_name.toLowerCase() === user.name.toLowerCase())
      );
      setFormData((prev) => ({
        ...prev,
        employee_id: matchingEmp ? matchingEmp.id : targetEmployeeId || employees[0]?.id || "",
        attendance_date: prev.attendance_date || new Date().toISOString().split("T")[0],
      }));
    } else {
      resetForm();
    }
  }, [editingAttendance, employees, user, targetEmployeeId, isPersonalOnly, isAdmin]);

  const resetForm = () => {
    let defaultEmpId = "";
    if (isPersonalOnly && employees.length > 0) {
      const matchingEmp = employees.find(
        (emp) =>
          Number(emp.id) === Number(targetEmployeeId) ||
          Number(emp.user_id) === Number(user?.id) ||
          (emp.email && user?.email && emp.email.toLowerCase() === user.email.toLowerCase()) ||
          (emp.full_name && user?.name && emp.full_name.toLowerCase() === user.name.toLowerCase())
      );
      defaultEmpId = matchingEmp ? matchingEmp.id : targetEmployeeId || employees[0]?.id || "";
    }

    setFormData({
      employee_id: defaultEmpId,
      attendance_date: new Date().toISOString().split("T")[0],
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

    if (isAdmin) {
      alert("Administrators do not record personal attendance.");
      return;
    }

    if (!formData.employee_id || !formData.attendance_date) {
      alert("Please select an employee and date.");
      return;
    }

    saveAttendance({
      ...formData,
      employee_id: Number(formData.employee_id),
      date: formData.attendance_date,
    });

    if (!isEditing) {
      resetForm();
    }
  };

  if (isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <ShieldAlert size={36} className="text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          Attendance Logging Restricted
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
          Administrators are excluded from personal attendance tracking and logs.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
        {isEditing ? "Update Attendance Record" : isPersonalOnly ? "Record Personal Attendance" : "Manual Attendance Override"}
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
              disabled={loadingEmployees || isEditing || isPersonalOnly}
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
            {isPersonalOnly && (
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                You are logging attendance for your own personal record.
              </p>
            )}
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