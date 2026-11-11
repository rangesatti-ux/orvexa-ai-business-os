import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Clock,
  LogIn,
  LogOut,
  RefreshCw,
  Users,
  ShieldAlert,
  Calendar,
} from "lucide-react";

import api from "../../services/api";
import AttendanceTable from "./AttendanceTable";
import { useAuth } from "../../context/AuthContext";

function AttendancePage() {
  const { user } = useAuth();
  const userRole = user?.role ? user.role.toLowerCase() : "employee";

  const isAdmin = userRole === "admin";
  const isHr = userRole === "hr";
  const isManager = userRole === "manager";
  const isEmployee = userRole === "employee";

  const [employees, setEmployees] = useState([]);
  const [filterEmployeeId, setFilterEmployeeId] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Primary identifier for personal check-in / check-out actions
  const personalEmployeeId = user?.employee_id || user?.id;

  // Helper function declared BEFORE it is used in useMemo hooks
  const getEmployeeName = (id) => {
    const employee = employees.find((item) => Number(item.id) === Number(id));
    return employee?.full_name || employee?.name || `Employee #${id}`;
  };

  // Load employees and scope dropdown options based on role
  const loadEmployees = async () => {
    if (isAdmin) return;
    try {
      setLoadingEmployees(true);
      const response = await api.get("/employees/", {
        params: { page: 1, limit: 100 },
      });
      let data = Array.isArray(response.data)
        ? response.data
        : response.data?.employees || response.data?.data || [];

      if (isHr) {
        data = data.filter((emp) => {
          const r = String(emp.role || "").toLowerCase();
          return r === "manager" || r === "employee";
        });
      } else if (isManager) {
        data = data.filter((emp) => {
          const r = String(emp.role || "").toLowerCase();
          return r === "employee" || Number(emp.id) === Number(personalEmployeeId);
        });
      } else if (isEmployee) {
        data = data.filter(
          (emp) =>
            Number(emp.id) === Number(personalEmployeeId) ||
            Number(emp.user_id) === Number(user?.id) ||
            (emp.email && user?.email && emp.email.toLowerCase() === user.email.toLowerCase())
        );
      }

      setEmployees(data);

      if (isEmployee && data.length > 0) {
        setFilterEmployeeId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Load attendance records with role restrictions
  const loadAttendance = async () => {
    try {
      setLoadingAttendance(true);
      const params = {};
      if (filterEmployeeId) {
        params.employee_id = Number(filterEmployeeId);
      }

      const response = await api.get("/attendance/", { params });
      let records = Array.isArray(response.data)
        ? response.data
        : response.data?.attendance || response.data?.items || [];

      if (isEmployee && user) {
        records = records.filter(
          (rec) =>
            Number(rec.employee_id) === Number(personalEmployeeId) ||
            Number(rec.employee_id) === Number(filterEmployeeId)
        );
      } else if (isManager || isHr) {
        const validEmpIds = employees.map((e) => Number(e.id));
        if (validEmpIds.length > 0) {
          records = records.filter((rec) => validEmpIds.includes(Number(rec.employee_id)));
        }
      }

      setAttendance(records);
    } catch (error) {
      console.error("Failed to load attendance:", error);
      setAttendance([]);
      toast.error("Failed to load attendance records.");
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [user]);

  useEffect(() => {
    loadAttendance();
  }, [filterEmployeeId, selectedDate, employees]);

  // Derive target employee ID for actions
  const getActionTargetId = () => {
    if (user?.employee_id) return user.employee_id;
    const matched = employees.find(
      (emp) =>
        Number(emp.user_id) === Number(user?.id) ||
        (emp.email && user?.email && emp.email.toLowerCase() === user.email.toLowerCase())
    );
    return matched ? matched.id : user?.id;
  };

  // Personal Check-In
  const handleCheckIn = async () => {
    const targetId = getActionTargetId();
    if (!targetId) {
      toast.warning("User profile reference missing.");
      return;
    }

    try {
      setActionLoading(true);
      await api.post("/attendance/check-in", {
        employee_id: Number(targetId),
      });
      toast.success("Checked in successfully for today.");
      await loadAttendance();
    } catch (error) {
      console.error("Check-in failed:", error);
      toast.error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Unable to check in."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Personal Check-Out
  const handleCheckOut = async () => {
    const targetId = getActionTargetId();
    if (!targetId) {
      toast.warning("User profile reference missing.");
      return;
    }

    try {
      setActionLoading(true);
      await api.post("/attendance/check-out", {
        employee_id: Number(targetId),
      });
      toast.success("Checked out successfully.");
      await loadAttendance();
    } catch (error) {
      console.error("Check-out failed:", error);
      toast.error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Unable to check out."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Filter by Date and Search Query (Safely placed *after* getEmployeeName definition)
  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const recDate = record.attendance_date || record.date || (record.created_at ? record.created_at.split("T")[0] : "");
      const matchesDate = selectedDate ? recDate === selectedDate : true;
      
      const query = search.trim().toLowerCase();
      const empName = getEmployeeName(record.employee_id).toLowerCase();
      const matchesQuery =
        !query ||
        empName.includes(query) ||
        String(record.employee_id).toLowerCase().includes(query) ||
        String(record.status).toLowerCase().includes(query);

      return matchesDate && matchesQuery;
    });
  }, [attendance, selectedDate, search, employees]);

  // Statistics calculation for the selected day/report view
  const statistics = useMemo(() => {
    const present = filteredAttendance.filter(
      (r) => String(r.status).toLowerCase() === "present"
    ).length;
    const absent = filteredAttendance.filter(
      (r) => String(r.status).toLowerCase() === "absent"
    ).length;
    const leave = filteredAttendance.filter(
      (r) => String(r.status).toLowerCase() === "leave"
    ).length;
    const checkedIn = filteredAttendance.filter(
      (r) => (r.check_in || r.time_in) && (!r.check_out && !r.time_out)
    ).length;

    return {
      total: filteredAttendance.length,
      present,
      absent,
      leave,
      checkedIn,
    };
  }, [filteredAttendance]);

  if (isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Access Restricted
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400 max-w-md">
          Administrators do not track personal attendance and are excluded from attendance logs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Attendance Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {isHr
              ? "Review day-wise attendance reports for managers and employees."
              : isManager
              ? "Oversee team attendance reports and daily presence."
              : "Track your personal attendance report and history."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <Calendar size={18} className="text-blue-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none text-sm font-medium"
            />
          </div>

          <button
            type="button"
            onClick={loadAttendance}
            disabled={loadingAttendance}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <RefreshCw size={16} className={loadingAttendance ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* CHECK-IN / OUT CONTROLS FOR NON-ADMINS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Users size={21} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {isEmployee ? "My Daily Attendance" : "Personal Check-In / Check-Out Action"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Mark your check-in or check-out status for {selectedDate}.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              <LogIn size={18} />
              {actionLoading ? "Processing..." : "Mark Check In"}
            </button>

            <button
              type="button"
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <LogOut size={18} />
              {actionLoading ? "Processing..." : "Mark Check Out"}
            </button>
          </div>

          {!isEmployee && employees.length > 0 && (
            <div className="w-full sm:w-72">
              <select
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">— View All Report ({isHr ? "Managers & Employees" : "Team"}) —</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name || emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* STATISTICS REPORT SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl bg-blue-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-95">Total Records</p>
          <p className="mt-2 text-3xl font-bold">{statistics.total}</p>
        </div>
        <div className="rounded-xl bg-green-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-95">Present</p>
          <p className="mt-2 text-3xl font-bold">{statistics.present}</p>
        </div>
        <div className="rounded-xl bg-red-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-95">Absent</p>
          <p className="mt-2 text-3xl font-bold">{statistics.absent}</p>
        </div>
        <div className="rounded-xl bg-yellow-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-95">Leave</p>
          <p className="mt-2 text-3xl font-bold">{statistics.leave}</p>
        </div>
        <div className="rounded-xl bg-purple-500 p-5 text-white shadow-sm">
          <p className="text-sm opacity-95">Active Check-Ins</p>
          <p className="mt-2 text-3xl font-bold">{statistics.checkedIn}</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by employee name or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 bg-white p-3 text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600 dark:bg-slate-800 dark:text-slate-300">
          <Clock size={17} />
          {isEmployee ? "Personal Attendance Log" : "Filtered Registry Report"}
        </div>
      </div>

      {/* ATTENDANCE TABLE REPORT */}
      <AttendanceTable
        attendance={filteredAttendance}
        getEmployeeName={getEmployeeName}
        loadingAttendance={loadingAttendance}
        employeeId={filterEmployeeId}
      />
    </div>
  );
}

export default AttendancePage;