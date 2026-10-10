import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Check,
  Clock,
  RefreshCw,
  Trash2,
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";

function LeavePage() {
  const [employees, setEmployees] = useState([]);
  const [leaveData, setLeaveData] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState("Casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [search, setSearch] = useState("");

  const [loadingEmployees, setLoadingEmployees] =
    useState(true);

  const [loadingLeaves, setLoadingLeaves] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const [stats, setStats] = useState({
    total_requests: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  // --------------------------------------------------
  // LOAD EMPLOYEES
  // --------------------------------------------------

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);

      const response = await api.get("/employees/", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.employees || [];

      setEmployees(data);
    } catch (error) {
      console.error(
        "Failed to load employees:",
        error
      );

      setEmployees([]);

      toast.error(
        error.response?.data?.detail ||
          "Unable to load employees."
      );
    } finally {
      setLoadingEmployees(false);
    }
  };

  // --------------------------------------------------
  // LOAD LEAVES
  // --------------------------------------------------

  const loadLeaves = async () => {
    try {
      setLoadingLeaves(true);

      const response = await api.get("/leaves/");

      setLeaveData(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load leaves:",
        error
      );

      setLeaveData([]);

      toast.error(
        error.response?.data?.detail ||
          "Unable to load leave records."
      );
    } finally {
      setLoadingLeaves(false);
    }
  };

  // --------------------------------------------------
  // LOAD LEAVE STATISTICS
  // --------------------------------------------------

  const loadStats = async () => {
    try {
      const response = await api.get(
        "/leaves/dashboard/stats"
      );

      setStats({
        total_requests:
          response.data?.total_requests || 0,

        approved:
          response.data?.approved || 0,

        pending:
          response.data?.pending || 0,

        rejected:
          response.data?.rejected || 0,
      });
    } catch (error) {
      console.error(
        "Failed to load leave statistics:",
        error
      );
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    loadEmployees();
    loadLeaves();
    loadStats();
  }, []);

  // --------------------------------------------------
  // REFRESH EVERYTHING
  // --------------------------------------------------

  const refreshAll = async () => {
    await Promise.all([
      loadEmployees(),
      loadLeaves(),
      loadStats(),
    ]);
  };

  // --------------------------------------------------
  // APPLY LEAVE
  // --------------------------------------------------

  const handleApplyLeave = async (e) => {
    e.preventDefault();

    if (!employeeId) {
      toast.warning("Please select an employee.");
      return;
    }

    if (!leaveType) {
      toast.warning("Please select a leave type.");
      return;
    }

    if (!startDate) {
      toast.warning("Please select a start date.");
      return;
    }

    if (!endDate) {
      toast.warning("Please select an end date.");
      return;
    }

    if (endDate < startDate) {
      toast.warning(
        "End date cannot be before start date."
      );
      return;
    }

    if (!reason.trim()) {
      toast.warning("Please enter a reason.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/leaves/", {
        employee_id: Number(employeeId),
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim(),
      });

      toast.success(
        "Leave request submitted successfully."
      );

      // Reset form
      setEmployeeId("");
      setLeaveType("Casual");
      setStartDate("");
      setEndDate("");
      setReason("");

      // Refresh backend data
      await Promise.all([
        loadLeaves(),
        loadStats(),
      ]);
    } catch (error) {
      console.error(
        "Failed to apply leave:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to apply for leave."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // UPDATE LEAVE STATUS
  // --------------------------------------------------

  const handleStatusUpdate = async (
    leaveId,
    status
  ) => {
    try {
      setUpdatingStatus(leaveId);

      await api.put(
        `/leaves/${leaveId}/status`,
        {
          status,
        }
      );

      toast.success(
        `Leave ${status.toLowerCase()} successfully.`
      );

      await Promise.all([
        loadLeaves(),
        loadStats(),
      ]);
    } catch (error) {
      console.error(
        "Failed to update leave status:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to update leave status."
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // --------------------------------------------------
  // DELETE LEAVE
  // --------------------------------------------------

  const handleDelete = async (leaveId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this leave request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(leaveId);

      await api.delete(`/leaves/${leaveId}`);

      toast.success(
        "Leave request deleted successfully."
      );

      await Promise.all([
        loadLeaves(),
        loadStats(),
      ]);
    } catch (error) {
      console.error(
        "Failed to delete leave:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to delete leave request."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getEmployeeName = (id) => {
    const employee = employees.find(
      (item) =>
        Number(item.id) === Number(id)
    );

    return (
      employee?.full_name ||
      employee?.name ||
      `Employee #${id}`
    );
  };

  const getEmployeeBusinessId = (id) => {
    const employee = employees.find(
      (item) =>
        Number(item.id) === Number(id)
    );

    return (
      employee?.employee_id ||
      id
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return date;
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredLeave = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return leaveData;
    }

    return leaveData.filter((leave) => {
      const employeeName =
        getEmployeeName(
          leave.employee_id
        ).toLowerCase();

      const employeeBusinessId =
        String(
          getEmployeeBusinessId(
            leave.employee_id
          )
        ).toLowerCase();

      return (
        employeeName.includes(query) ||
        employeeBusinessId.includes(query) ||
        String(leave.leave_type)
          .toLowerCase()
          .includes(query) ||
        String(leave.status)
          .toLowerCase()
          .includes(query) ||
        String(leave.reason)
          .toLowerCase()
          .includes(query)
      );
    });
  }, [leaveData, employees, search]);

  // --------------------------------------------------
  // STATUS BADGE
  // --------------------------------------------------

  const getStatusClass = (status) => {
    const normalized = String(
      status || ""
    ).toLowerCase();

    if (normalized === "approved") {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }

    if (normalized === "rejected") {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }

    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Leave Management
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Apply, review and manage employee leave requests.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshAll}
          disabled={
            loadingEmployees ||
            loadingLeaves
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          <RefreshCw
            size={17}
            className={
              loadingEmployees ||
              loadingLeaves
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl bg-blue-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">
            Total Requests
          </p>

          <p className="mt-2 text-3xl font-bold">
            {stats.total_requests}
          </p>
        </div>

        <div className="rounded-xl bg-green-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">
            Approved
          </p>

          <p className="mt-2 text-3xl font-bold">
            {stats.approved}
          </p>
        </div>

        <div className="rounded-xl bg-yellow-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold">
            {stats.pending}
          </p>
        </div>

        <div className="rounded-xl bg-red-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">
            Rejected
          </p>

          <p className="mt-2 text-3xl font-bold">
            {stats.rejected}
          </p>
        </div>

      </div>

      {/* APPLY LEAVE */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">

        <div className="mb-6 flex items-start gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <CalendarDays
              size={21}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Apply for Leave
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Submit a new leave request for an employee.
            </p>
          </div>

        </div>

        <form
          onSubmit={handleApplyLeave}
          className="space-y-5"
        >

          {/* EMPLOYEE + TYPE */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Employee
              </label>

              <select
                value={employeeId}
                onChange={(e) =>
                  setEmployeeId(
                    e.target.value
                  )
                }
                disabled={
                  loadingEmployees ||
                  submitting
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              >

                <option value="">
                  {loadingEmployees
                    ? "Loading employees..."
                    : employees.length === 0
                    ? "No employees found"
                    : "Select an employee"}
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.full_name} — Employee #
                      {employee.employee_id ||
                        employee.id}
                    </option>
                  )
                )}

              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Leave Type
              </label>

              <select
                value={leaveType}
                onChange={(e) =>
                  setLeaveType(
                    e.target.value
                  )
                }
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              >
                <option value="Casual">
                  Casual
                </option>

                <option value="Sick">
                  Sick
                </option>

                <option value="Emergency">
                  Emergency
                </option>

                <option value="Earned">
                  Earned
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

          </div>

          {/* DATES */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>

          </div>

          {/* REASON */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              placeholder="Enter reason for leave..."
              rows={4}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* SUBMIT */}
          <div className="flex justify-end">

            <button
              type="submit"
              disabled={
                submitting ||
                loadingEmployees
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CalendarDays size={18} />

              {submitting
                ? "Submitting..."
                : "Apply for Leave"}
            </button>

          </div>

        </form>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col gap-3 sm:flex-row">

        <input
          type="text"
          placeholder="Search by employee, leave type, status or reason..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="flex-1 rounded-lg border border-gray-300 bg-white p-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600 dark:bg-slate-800 dark:text-slate-300">
          <Users size={17} />

          {leaveData.length} Requests
        </div>

      </div>

      {/* LEAVE TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px] text-left">

            <thead className="border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-900">

              <tr>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  ID
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Employee
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Leave Type
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Start Date
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  End Date
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Reason
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Status
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">

              {loadingLeaves ? (
                <tr>

                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-gray-500 dark:text-slate-400"
                  >
                    Loading leave requests...
                  </td>

                </tr>
              ) : filteredLeave.length === 0 ? (
                <tr>

                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-gray-500 dark:text-slate-400"
                  >
                    No leave requests found.
                  </td>

                </tr>
              ) : (
                filteredLeave.map(
                  (leave) => (
                    <tr
                      key={leave.id}
                      className="transition hover:bg-gray-50 dark:hover:bg-slate-700/40"
                    >

                      {/* ID */}
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                        {leave.id}
                      </td>

                      {/* EMPLOYEE */}
                      <td className="px-5 py-4">

                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {getEmployeeName(
                            leave.employee_id
                          )}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          Employee #
                          {getEmployeeBusinessId(
                            leave.employee_id
                          )}
                        </p>

                      </td>

                      {/* TYPE */}
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">
                        {leave.leave_type ||
                          "—"}
                      </td>

                      {/* START */}
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                        {formatDate(
                          leave.start_date
                        )}
                      </td>

                      {/* END */}
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                        {formatDate(
                          leave.end_date
                        )}
                      </td>

                      {/* REASON */}
                      <td className="max-w-xs px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                        <p className="truncate">
                          {leave.reason ||
                            "—"}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            leave.status
                          )}`}
                        >
                          {leave.status ||
                            "Unknown"}
                        </span>

                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          {String(
                            leave.status
                          ).toLowerCase() ===
                            "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusUpdate(
                                    leave.id,
                                    "Approved"
                                  )
                                }
                                disabled={
                                  updatingStatus ===
                                  leave.id
                                }
                                title="Approve Leave"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-700 transition hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                              >
                                <Check
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusUpdate(
                                    leave.id,
                                    "Rejected"
                                  )
                                }
                                disabled={
                                  updatingStatus ===
                                  leave.id
                                }
                                title="Reject Leave"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                              >
                                <X
                                  size={17}
                                />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                leave.id
                              )
                            }
                            disabled={
                              deletingId ===
                              leave.id
                            }
                            title="Delete Leave"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* FOOTER INFORMATION */}
      {employeeId && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
          <Clock size={17} />

          Selected employee:{" "}
          {getEmployeeName(employeeId)}
        </div>
      )}

    </div>
  );
}

export default LeavePage;