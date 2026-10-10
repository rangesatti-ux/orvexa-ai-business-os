import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Calculator,
  IndianRupee,
  Users,
  Trash2,
  RefreshCw,
  Search,
  Plus,
  X,
} from "lucide-react";

import api from "../../services/api";

function PayrollPage() {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  const [stats, setStats] = useState({
    employees_paid: 0,
    total_salary_paid: 0,
  });

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: "",
    month: "",
    basic_salary: "",
    hra: "0",
    allowance: "0",
    bonus: "0",
    deduction: "0",
  });

  const currency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  // --------------------------------------------------
  // Load employees
  // --------------------------------------------------

  const loadEmployees = async () => {
    const response = await api.get(
      "/employees/?page=1&limit=100"
    );

    setEmployees(response.data?.employees || []);
  };

  // --------------------------------------------------
  // Load payrolls
  // --------------------------------------------------

  const loadPayrolls = async () => {
    const response = await api.get(
      "/payroll/?page=1&limit=100"
    );

    setPayrolls(response.data?.payrolls || []);
  };

  // --------------------------------------------------
  // Load dashboard stats
  // --------------------------------------------------

  const loadStats = async () => {
    const response = await api.get(
      "/payroll/dashboard/stats"
    );

    setStats({
      employees_paid: response.data?.employees_paid || 0,
      total_salary_paid:
        response.data?.total_salary_paid || 0,
    });
  };

  // --------------------------------------------------
  // Load everything
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadEmployees(),
        loadPayrolls(),
        loadStats(),
      ]);
    } catch (err) {
      console.error("Payroll loading error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Unable to load payroll data.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // Handle form input
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Automatically load employee salary
    if (name === "employee_id") {
      const selectedEmployee = employees.find(
        (employee) =>
          String(employee.id) === String(value)
      );

      if (selectedEmployee) {
        setFormData((prev) => ({
          ...prev,
          employee_id: value,
          basic_salary:
            selectedEmployee.salary ?? "",
        }));
      }
    }
  };

  // --------------------------------------------------
  // Calculate preview net salary
  // --------------------------------------------------

  const calculatedNetSalary = useMemo(() => {
    const basic = Number(formData.basic_salary) || 0;
    const hra = Number(formData.hra) || 0;
    const allowance =
      Number(formData.allowance) || 0;
    const bonus = Number(formData.bonus) || 0;
    const deduction =
      Number(formData.deduction) || 0;

    return basic + hra + allowance + bonus - deduction;
  }, [formData]);

  // --------------------------------------------------
  // Create payroll
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee_id) {
      toast.error("Please select an employee.");
      return;
    }

    if (!formData.month) {
      toast.error("Please select a payroll month.");
      return;
    }

    if (
      formData.basic_salary === "" ||
      Number(formData.basic_salary) < 0
    ) {
      toast.error("Please enter a valid basic salary.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        employee_id: Number(formData.employee_id),
        month: formData.month,
        basic_salary: Number(formData.basic_salary) || 0,
        hra: Number(formData.hra) || 0,
        allowance:
          Number(formData.allowance) || 0,
        bonus: Number(formData.bonus) || 0,
        deduction:
          Number(formData.deduction) || 0,
      };

      await api.post("/payroll/", payload);

      toast.success("Payroll generated successfully.");

      setFormData({
        employee_id: "",
        month: "",
        basic_salary: "",
        hra: "0",
        allowance: "0",
        bonus: "0",
        deduction: "0",
      });

      setShowForm(false);

      await Promise.all([
        loadPayrolls(),
        loadStats(),
      ]);
    } catch (err) {
      console.error("Payroll creation error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Unable to generate payroll.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Delete payroll
  // --------------------------------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payroll record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/payroll/${id}`);

      toast.success("Payroll deleted successfully.");

      await Promise.all([
        loadPayrolls(),
        loadStats(),
      ]);
    } catch (err) {
      console.error("Payroll delete error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Unable to delete payroll.";

      toast.error(message);
    }
  };

  // --------------------------------------------------
  // Find employee details
  // --------------------------------------------------

  const getEmployee = (employeeId) => {
    return employees.find(
      (employee) =>
        Number(employee.id) === Number(employeeId)
    );
  };

  // --------------------------------------------------
  // Search payroll
  // --------------------------------------------------

  const filteredPayrolls = payrolls.filter(
    (record) => {
      const employee = getEmployee(
        record.employee_id
      );

      const employeeName =
        employee?.full_name || "";

      const employeeCode =
        employee?.employee_id || "";

      const month = record.month || "";

      const query = search.toLowerCase();

      return (
        employeeName
          .toLowerCase()
          .includes(query) ||
        String(employeeCode)
          .toLowerCase()
          .includes(query) ||
        month
          .toLowerCase()
          .includes(query)
      );
    }
  );

  // --------------------------------------------------
  // Format month
  // --------------------------------------------------

  const formatMonth = (month) => {
    if (!month) {
      return "-";
    }

    // Handles YYYY-MM
    if (/^\d{4}-\d{2}$/.test(month)) {
      const [year, monthNumber] =
        month.split("-");

      const date = new Date(
        Number(year),
        Number(monthNumber) - 1,
        1
      );

      return date.toLocaleDateString(
        "en-IN",
        {
          month: "long",
          year: "numeric",
        }
      );
    }

    return month;
  };

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Payroll Management
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage employee payroll and salary records.
          </p>
        </div>

        <div className="flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 p-12 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
            <RefreshCw
              size={20}
              className="animate-spin"
            />
            Loading payroll data...
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Payroll Management
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Generate and manage employee payroll.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              setShowForm((prev) => !prev)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            {showForm ? (
              <X size={18} />
            ) : (
              <Plus size={18} />
            )}

            {showForm
              ? "Close Form"
              : "Generate Payroll"}
          </button>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Employees Paid
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.employees_paid}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Users size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Salary Paid
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {currency(stats.total_salary_paid)}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <IndianRupee size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Generate Payroll Form */}

      {showForm && (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Generate Payroll
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Create a payroll record for an employee.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Employee + Month */}

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
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">
                    Select Employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.full_name} — ID:{" "}
                      {employee.employee_id}
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

            {/* Salary fields */}

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

            {/* Net salary preview */}

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
                      {currency(
                        calculatedNetSalary
                      )}
                    </p>
                  </div>
                </div>

                <div className="hidden text-right text-xs text-gray-500 sm:block dark:text-slate-400">
                  Basic + HRA + Allowance + Bonus
                  <br />
                  − Deduction
                </div>
              </div>
            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);

                  setFormData({
                    employee_id: "",
                    month: "",
                    basic_salary: "",
                    hra: "0",
                    allowance: "0",
                    bonus: "0",
                    deduction: "0",
                  });
                }}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                )}

                {submitting
                  ? "Generating..."
                  : "Generate Payroll"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payroll History */}

      <div className="rounded-2xl bg-white shadow-sm dark:bg-slate-800">
        <div className="border-b border-gray-100 p-5 dark:border-slate-700">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Payroll History
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {payrolls.length} payroll record
                {payrolls.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search employee or month..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left dark:border-slate-700 dark:bg-slate-900/50">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Employee
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Month
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Basic
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  HRA
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Allowance
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Bonus
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Deduction
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Net Salary
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPayrolls.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <IndianRupee
                        size={40}
                        className="text-gray-300 dark:text-slate-600"
                      />

                      <p className="mt-3 font-medium text-gray-600 dark:text-slate-300">
                        No payroll records found
                      </p>

                      <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
                        Generate a payroll record to see
                        it here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map(
                  (record) => {
                    const employee =
                      getEmployee(
                        record.employee_id
                      );

                    return (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/30"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {employee?.full_name ||
                                `Employee #${record.employee_id}`}
                            </p>

                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              ID:{" "}
                              {employee?.employee_id ||
                                record.employee_id}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                          {formatMonth(
                            record.month
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">
                          {currency(
                            record.basic_salary
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">
                          {currency(record.hra)}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">
                          {currency(
                            record.allowance
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-green-600 dark:text-green-400">
                          {currency(record.bonus)}
                        </td>

                        <td className="px-5 py-4 text-sm text-red-600 dark:text-red-400">
                          {currency(
                            record.deduction
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {currency(
                              record.net_salary
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                record.id
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                            title="Delete payroll"
                          >
                            <Trash2 size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PayrollPage;