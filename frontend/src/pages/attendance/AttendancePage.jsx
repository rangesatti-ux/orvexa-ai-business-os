import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Clock,
  LogIn,
  LogOut,
  RefreshCw,
  Users,
} from "lucide-react";

import api from "../../services/api";

function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [attendance, setAttendance] = useState([]);

  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");

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

      // Backend returns:
      // {
      //   total: 6,
      //   page: 1,
      //   limit: 10,
      //   total_pages: 1,
      //   employees: [...]
      // }

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.employees || [];

      setEmployees(data);

      // Keep selected employee if it still exists
      if (employeeId) {
        const exists = data.some(
          (employee) =>
            Number(employee.id) === Number(employeeId)
        );

        if (!exists) {
          setEmployeeId("");
          setAttendance([]);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load employees:",
        error
      );

      setEmployees([]);
      setEmployeeId("");
      setAttendance([]);

      toast.error(
        error.response?.data?.detail ||
          "Unable to load employees from the backend."
      );
    } finally {
      setLoadingEmployees(false);
    }
  };

  // --------------------------------------------------
  // LOAD ATTENDANCE
  // --------------------------------------------------

  const loadAttendance = async () => {
    if (!employeeId) {
      setAttendance([]);
      return;
    }

    try {
      setLoadingAttendance(true);

      const response = await api.get("/attendance/", {
        params: {
          employee_id: Number(employeeId),
        },
      });

      setAttendance(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load attendance:",
        error
      );

      setAttendance([]);

      toast.error(
        error.response?.data?.detail ||
          "Failed to load attendance records."
      );
    } finally {
      setLoadingAttendance(false);
    }
  };

  // --------------------------------------------------
  // INITIAL EMPLOYEE LOAD
  // --------------------------------------------------

  useEffect(() => {
    loadEmployees();
  }, []);

  // --------------------------------------------------
  // LOAD ATTENDANCE WHEN EMPLOYEE CHANGES
  // --------------------------------------------------

  useEffect(() => {
    loadAttendance();
  }, [employeeId]);

  // --------------------------------------------------
  // CHECK IN
  // --------------------------------------------------

  const handleCheckIn = async () => {
    if (!employeeId) {
      toast.warning("Please select an employee.");
      return;
    }

    try {
      setActionLoading(true);

      await api.post("/attendance/check-in", {
        employee_id: Number(employeeId),
      });

      toast.success(
        "Employee checked in successfully."
      );

      await loadAttendance();
    } catch (error) {
      console.error(
        "Check-in failed:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
          "Unable to check in employee."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // CHECK OUT
  // --------------------------------------------------

  const handleCheckOut = async () => {
    if (!employeeId) {
      toast.warning("Please select an employee.");
      return;
    }

    try {
      setActionLoading(true);

      await api.post("/attendance/check-out", {
        employee_id: Number(employeeId),
      });

      toast.success(
        "Employee checked out successfully."
      );

      await loadAttendance();
    } catch (error) {
      console.error(
        "Check-out failed:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
          "Unable to check out employee."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredAttendance = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return attendance;
    }

    return attendance.filter((record) => {
      return (
        String(record.employee_id)
          .toLowerCase()
          .includes(query) ||
        String(record.attendance_date)
          .toLowerCase()
          .includes(query) ||
        String(record.status)
          .toLowerCase()
          .includes(query)
      );
    });
  }, [attendance, search]);

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const statistics = useMemo(() => {
    const present = attendance.filter(
      (record) =>
        String(record.status).toLowerCase() ===
        "present"
    ).length;

    const absent = attendance.filter(
      (record) =>
        String(record.status).toLowerCase() ===
        "absent"
    ).length;

    const leave = attendance.filter(
      (record) =>
        String(record.status).toLowerCase() ===
        "leave"
    ).length;

    const checkedIn = attendance.filter(
      (record) =>
        record.check_in &&
        !record.check_out
    ).length;

    return {
      total: attendance.length,
      present,
      absent,
      leave,
      checkedIn,
    };
  }, [attendance]);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const formatTime = (time) => {
    if (!time) {
      return "—";
    }

    return String(time).substring(0, 8);
  };

  const formatWorkingHours = (hours) => {
    if (
      hours === null ||
      hours === undefined
    ) {
      return "—";
    }

    return `${Number(hours).toFixed(2)} hrs`;
  };

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

  const selectedEmployee = employees.find(
    (employee) =>
      Number(employee.id) === Number(employeeId)
  );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Attendance Management
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage employee check-in, check-out and attendance history.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={loadEmployees}
            disabled={loadingEmployees}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <RefreshCw
              size={17}
              className={
                loadingEmployees
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh Employees
          </button>

          <button
            type="button"
            onClick={loadAttendance}
            disabled={
              !employeeId ||
              loadingAttendance
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <RefreshCw
              size={17}
              className={
                loadingAttendance
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh Attendance
          </button>

        </div>
      </div>

      {/* ATTENDANCE ACTIONS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">

        <div className="mb-5 flex items-start gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Users
              size={21}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Attendance Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Select an employee to manage their attendance.
            </p>
          </div>

        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">

          {/* EMPLOYEE DROPDOWN */}
          <div className="w-full xl:max-w-md">

            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Employee
            </label>

            <select
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(e.target.value)
              }
              disabled={
                loadingEmployees ||
                actionLoading
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

              {employees.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.full_name ||
                    "Unnamed Employee"}{" "}
                  — Employee #
                  {employee.employee_id ||
                    employee.id}
                </option>
              ))}

            </select>

          </div>

          {/* SELECTED EMPLOYEE */}
          {selectedEmployee && (
            <div className="rounded-lg bg-gray-100 px-4 py-3 dark:bg-slate-900">

              <p className="text-xs text-gray-500 dark:text-slate-400">
                Selected Employee
              </p>

              <p className="mt-1 font-semibold text-gray-800 dark:text-white">
                {selectedEmployee.full_name}
              </p>

              <p className="text-xs text-gray-500 dark:text-slate-400">
                Database ID:{" "}
                {selectedEmployee.id}
                {" • "}
                Employee ID:{" "}
                {selectedEmployee.employee_id}
              </p>

            </div>
          )}

          {/* BUTTONS */}
          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={handleCheckIn}
              disabled={
                !employeeId ||
                actionLoading
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogIn size={18} />

              {actionLoading
                ? "Processing..."
                : "Check In"}
            </button>

            <button
              type="button"
              onClick={handleCheckOut}
              disabled={
                !employeeId ||
                actionLoading
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={18} />

              {actionLoading
                ? "Processing..."
                : "Check Out"}
            </button>

          </div>

        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <div className="rounded-xl bg-blue-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">
            Total Records
          </p>

          <p className="mt-2 text-3xl font-bold">
            {statistics.total}
          </p>
        </div>

        <div className="rounded-xl bg-green-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">
            Present
          </p>

          <p className="mt-2 text-3xl font-bold">
            {statistics.present}
          </p>
        </div>

        <div className="rounded-xl bg-red-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">
            Absent
          </p>

          <p className="mt-2 text-3xl font-bold">
            {statistics.absent}
          </p>
        </div>

        <div className="rounded-xl bg-yellow-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">
            Leave
          </p>

          <p className="mt-2 text-3xl font-bold">
            {statistics.leave}
          </p>
        </div>

        <div className="rounded-xl bg-purple-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">
            Currently Checked In
          </p>

          <p className="mt-2 text-3xl font-bold">
            {statistics.checkedIn}
          </p>
        </div>

      </div>

      {/* SEARCH */}
      <div className="flex flex-col gap-3 sm:flex-row">

        <input
          type="text"
          placeholder="Search by employee ID, date or status..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="flex-1 rounded-lg border border-gray-300 bg-white p-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

        {employeeId && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600 dark:bg-slate-800 dark:text-slate-300">
            <Clock size={17} />

            {getEmployeeName(employeeId)}
          </div>
        )}

      </div>

      {/* ATTENDANCE TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px] text-left">

            <thead className="border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-900">

              <tr>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  ID
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Employee
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Date
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Check In
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Check Out
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Working Hours
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Status
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Remarks
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">

              {loadingAttendance ? (
                <tr>

                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-gray-500 dark:text-slate-400"
                  >
                    Loading attendance...
                  </td>

                </tr>
              ) : filteredAttendance.length === 0 ? (
                <tr>

                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-gray-500 dark:text-slate-400"
                  >
                    {employeeId
                      ? "No attendance records found for this employee."
                      : "Select an employee to view attendance."}
                  </td>

                </tr>
              ) : (
                filteredAttendance.map(
                  (record) => (
                    <tr
                      key={record.id}
                      className="transition hover:bg-gray-50 dark:hover:bg-slate-700/40"
                    >

                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                        {record.id}
                      </td>

                      <td className="px-5 py-4">

                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {getEmployeeName(
                            record.employee_id
                          )}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          DB ID:{" "}
                          {record.employee_id}
                        </p>

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                        {record.attendance_date ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                        {formatTime(
                          record.check_in
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                        {formatTime(
                          record.check_out
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-slate-200">
                        {formatWorkingHours(
                          record.working_hours
                        )}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            String(
                              record.status
                            ).toLowerCase() ===
                            "present"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : String(
                                  record.status
                                ).toLowerCase() ===
                                "absent"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {record.status ||
                            "Unknown"}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                        {record.remarks ||
                          "—"}
                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
}

export default AttendancePage;