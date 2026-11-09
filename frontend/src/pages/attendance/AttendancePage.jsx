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
import AttendanceTable from "./AttendanceTable";

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

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.employees || [];

      setEmployees(data);

      if (employeeId) {
        const exists = data.some(
          (employee) => Number(employee.id) === Number(employeeId)
        );

        if (!exists) {
          setEmployeeId("");
          setAttendance([]);
        }
      }
    } catch (error) {
      console.error("Failed to load employees:", error);
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
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Failed to load attendance:", error);
      setAttendance([]);

      toast.error(
        error.response?.data?.detail ||
          "Failed to load attendance records."
      );
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

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

      toast.success("Employee checked in successfully.");
      await loadAttendance();
    } catch (error) {
      console.error("Check-in failed:", error);
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

      toast.success("Employee checked out successfully.");
      await loadAttendance();
    } catch (error) {
      console.error("Check-out failed:", error);
      toast.error(
        error.response?.data?.detail ||
          "Unable to check out employee."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // SEARCH FILTER
  // --------------------------------------------------
  const filteredAttendance = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return attendance;
    }

    return attendance.filter((record) => {
      return (
        String(record.employee_id).toLowerCase().includes(query) ||
        String(record.attendance_date).toLowerCase().includes(query) ||
        String(record.status).toLowerCase().includes(query)
      );
    });
  }, [attendance, search]);

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------
  const statistics = useMemo(() => {
    const present = attendance.filter(
      (record) => String(record.status).toLowerCase() === "present"
    ).length;

    const absent = attendance.filter(
      (record) => String(record.status).toLowerCase() === "absent"
    ).length;

    const leave = attendance.filter(
      (record) => String(record.status).toLowerCase() === "leave"
    ).length;

    const checkedIn = attendance.filter(
      (record) => record.check_in && !record.check_out
    ).length;

    return {
      total: attendance.length,
      present,
      absent,
      leave,
      checkedIn,
    };
  }, [attendance]);

  const getEmployeeName = (id) => {
    const employee = employees.find(
      (item) => Number(item.id) === Number(id)
    );
    return (
      employee?.full_name ||
      employee?.name ||
      `Employee #${id}`
    );
  };

  const selectedEmployee = employees.find(
    (employee) => Number(employee.id) === Number(employeeId)
  );

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
              className={loadingEmployees ? "animate-spin" : ""}
            />
            Refresh Employees
          </button>

          <button
            type="button"
            onClick={loadAttendance}
            disabled={!employeeId || loadingAttendance}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <RefreshCw
              size={17}
              className={loadingAttendance ? "animate-spin" : ""}
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
              Select an employee to manage their attendance check-in/out.
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
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={loadingEmployees || actionLoading}
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
                <option key={employee.id} value={employee.id}>
                  {employee.full_name || employee.name || "Unnamed Employee"}{" "}
                  — Employee #{employee.employee_id || employee.id}
                </option>
              ))}
            </select>
          </div>

          {/* SELECTED EMPLOYEE DETAILS */}
          {selectedEmployee && (
            <div className="rounded-lg bg-gray-100 px-4 py-3 dark:bg-slate-900">
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Selected Employee
              </p>
              <p className="mt-1 font-semibold text-gray-800 dark:text-white">
                {selectedEmployee.full_name || selectedEmployee.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                DB ID: {selectedEmployee.id} • Employee ID:{" "}
                {selectedEmployee.employee_id}
              </p>
            </div>
          )}

          {/* CHECK IN / OUT BUTTONS */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={!employeeId || actionLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogIn size={18} />
              {actionLoading ? "Processing..." : "Check In"}
            </button>

            <button
              type="button"
              onClick={handleCheckOut}
              disabled={!employeeId || actionLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={18} />
              {actionLoading ? "Processing..." : "Check Out"}
            </button>
          </div>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl bg-blue-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">Total Records</p>
          <p className="mt-2 text-3xl font-bold">{statistics.total}</p>
        </div>
        <div className="rounded-xl bg-green-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">Present</p>
          <p className="mt-2 text-3xl font-bold">{statistics.present}</p>
        </div>
        <div className="rounded-xl bg-red-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">Absent</p>
          <p className="mt-2 text-3xl font-bold">{statistics.absent}</p>
        </div>
        <div className="rounded-xl bg-yellow-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">Leave</p>
          <p className="mt-2 text-3xl font-bold">{statistics.leave}</p>
        </div>
        <div className="rounded-xl bg-purple-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-90">Currently Checked In</p>
          <p className="mt-2 text-3xl font-bold">{statistics.checkedIn}</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by date or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      <AttendanceTable
        attendance={filteredAttendance}
        getEmployeeName={getEmployeeName}
        loadingAttendance={loadingAttendance}
        employeeId={employeeId}
      />
    </div>
  );
}

export default AttendancePage;