import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function LeaveForm({
  saveLeave,
  editingLeave,
  isEditing,
  employees = [],
  loadingEmployees = false,
  submitting = false,
}) {
  const { user } = useAuth();
  const userRole = user?.role ? user.role.toLowerCase() : "employee";
  const isEmployee = userRole === "employee";
  const isHr = userRole === "hr";
  const isPersonalOnly = isEmployee || isHr;

  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type: "Casual",
    start_date: "",
    end_date: "",
    reason: "",
  });

  // Auto-detect and pre-fill employee ID if the user is an employee or HR
  useEffect(() => {
    if (editingLeave) {
      setFormData({
        employee_id: editingLeave.employee_id || "",
        leave_type: editingLeave.leave_type || "Casual",
        start_date: editingLeave.start_date || "",
        end_date: editingLeave.end_date || "",
        reason: editingLeave.reason || "",
      });
    } else if (isPersonalOnly && employees.length > 0) {
      const matchingEmp = employees.find(
        (emp) =>
          (emp.email && user?.email && emp.email.toLowerCase() === user.email.toLowerCase()) ||
          (emp.full_name && user?.name && emp.full_name.toLowerCase() === user.name.toLowerCase()) ||
          Number(emp.id) === Number(user?.id)
      );
      setFormData((prev) => ({
        ...prev,
        employee_id: matchingEmp ? matchingEmp.id : employees[0]?.id || "",
      }));
    } else {
      resetForm();
    }
  }, [editingLeave, employees, user, isPersonalOnly]);

  const resetForm = () => {
    let defaultEmpId = "";
    if (isPersonalOnly && employees.length > 0) {
      const matchingEmp = employees.find(
        (emp) =>
          (emp.email && user?.email && emp.email.toLowerCase() === user.email.toLowerCase()) ||
          (emp.full_name && user?.name && emp.full_name.toLowerCase() === user.name.toLowerCase()) ||
          Number(emp.id) === Number(user?.id)
      );
      defaultEmpId = matchingEmp ? matchingEmp.id : employees[0]?.id || "";
    }

    setFormData({
      employee_id: defaultEmpId,
      leave_type: "Casual",
      start_date: "",
      end_date: "",
      reason: "",
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

    if (!formData.employee_id || !formData.start_date || !formData.end_date) {
      alert("Please fill in all required fields.");
      return;
    }

    if (formData.start_date > formData.end_date) {
      alert("Start Date cannot be after End Date.");
      return;
    }

    if (!formData.reason.trim()) {
      alert("Please enter a reason for the leave request.");
      return;
    }

    saveLeave({
      ...formData,
      employee_id: Number(formData.employee_id),
      reason: formData.reason.trim(),
    });

    if (!isEditing) {
      resetForm();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        {isEditing ? "Update Leave Request" : "Apply for Leave"}
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
              disabled={loadingEmployees || submitting || isEditing || isPersonalOnly}
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
                You are submitting this request for your own profile.
              </p>
            )}
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Leave Type
            </label>
            <select
              name="leave_type"
              value={formData.leave_type}
              onChange={handleChange}
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Emergency">Emergency</option>
              <option value="Earned">Earned</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              min={formData.start_date || undefined}
              value={formData.end_date}
              onChange={handleChange}
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              required
            />
          </div>

          {/* Reason */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Reason
            </label>
            <textarea
              name="reason"
              rows="3"
              placeholder="State reason for leave request..."
              value={formData.reason}
              onChange={handleChange}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : isEditing ? "Update Leave" : "Submit Leave Request"}
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

export default LeaveForm;