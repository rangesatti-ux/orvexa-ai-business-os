import { useState, useEffect, useMemo } from "react";
import { Calculator } from "lucide-react";

function PayrollForm({
  savePayroll,
  editingPayroll,
  isEditing,
  employees = [],
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState({
    employee_id: "",
    month: "",
    basic_salary: "",
    hra: "0",
    allowance: "0",
    bonus: "0",
    deduction: "0",
  });

  useEffect(() => {
    if (editingPayroll) {
      setFormData({
        employee_id: editingPayroll.employee_id || "",
        month: editingPayroll.month || "",
        basic_salary: editingPayroll.basic_salary || "",
        hra: editingPayroll.hra || "0",
        allowance: editingPayroll.allowance || "0",
        bonus: editingPayroll.bonus || "0",
        deduction: editingPayroll.deduction || "0",
      });
    } else {
      setFormData({
        employee_id: "",
        month: "",
        basic_salary: "",
        hra: "0",
        allowance: "0",
        bonus: "0",
        deduction: "0",
      });
    }
  }, [editingPayroll]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "employee_id") {
      const selectedEmployee = employees.find(
        (emp) => String(emp.id) === String(value)
      );
      if (selectedEmployee) {
        setFormData((prev) => ({
          ...prev,
          employee_id: value,
          basic_salary: selectedEmployee.salary ?? prev.basic_salary,
        }));
      }
    }
  };

  const calculatedNetSalary = useMemo(() => {
    const basic = Number(formData.basic_salary) || 0;
    const hra = Number(formData.hra) || 0;
    const allowance = Number(formData.allowance) || 0;
    const bonus = Number(formData.bonus) || 0;
    const deduction = Number(formData.deduction) || 0;
    return basic + hra + allowance + bonus - deduction;
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.employee_id || !formData.month) {
      alert("Please select an employee and payroll month.");
      return;
    }

    savePayroll({
      employee_id: Number(formData.employee_id),
      month: formData.month,
      basic_salary: Number(formData.basic_salary) || 0,
      hra: Number(formData.hra) || 0,
      allowance: Number(formData.allowance) || 0,
      bonus: Number(formData.bonus) || 0,
      deduction: Number(formData.deduction) || 0,
    });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {isEditing ? "Update Payroll" : "Generate Payroll"}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Create or update a payroll record for an employee.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Employee
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
              disabled={isEditing}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white disabled:opacity-60"
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name || employee.name} — ID: {employee.employee_id || employee.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Payroll Month
            </label>
            <input
              type="month"
              name="month"
              value={formData.month}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Basic Salary
            </label>
            <input
              type="number"
              name="basic_salary"
              min="0"
              step="0.01"
              value={formData.basic_salary}
              onChange={handleChange}
              placeholder="Enter basic salary"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              HRA
            </label>
            <input
              type="number"
              name="hra"
              min="0"
              step="0.01"
              value={formData.hra}
              onChange={handleChange}
              placeholder="0"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Allowance
            </label>
            <input
              type="number"
              name="allowance"
              min="0"
              step="0.01"
              value={formData.allowance}
              onChange={handleChange}
              placeholder="0"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Bonus
            </label>
            <input
              type="number"
              name="bonus"
              min="0"
              step="0.01"
              value={formData.bonus}
              onChange={handleChange}
              placeholder="0"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Deduction
            </label>
            <input
              type="number"
              name="deduction"
              min="0"
              step="0.01"
              value={formData.deduction}
              onChange={handleChange}
              placeholder="0"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Calculator size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  Estimated Net Salary
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{Number(calculatedNetSalary || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEditing ? "Update Payroll" : "Generate Payroll"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PayrollForm;