import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import AttendanceForm from "./AttendanceForm";
import AttendanceTable from "./AttendanceTable";

function AttendancePage() {
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem("attendance");

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "John Doe",
            department: "IT",
            date: "2026-07-29",
            status: "Present",
          },
          {
            id: 2,
            name: "Alice",
            department: "HR",
            date: "2026-07-29",
            status: "Absent",
          },
        ];
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "attendance",
      JSON.stringify(attendance)
    );
  }, [attendance]);

  const addAttendance = (record) => {
    setAttendance((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...record,
      },
    ]);

    toast.success("Attendance Added Successfully");
  };

  const deleteAttendance = (id) => {
    setAttendance((prev) =>
      prev.filter((item) => item.id !== id)
    );

    toast.error("Attendance Deleted");
  };

  const filteredAttendance = attendance.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Attendance Management
      </h1>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-blue-500 text-white rounded-xl p-5">
          <h3>Total Employees</h3>
          <p className="text-3xl font-bold">
            {attendance.length}
          </p>
        </div>

        <div className="bg-green-500 text-white rounded-xl p-5">
          <h3>Present</h3>
          <p className="text-3xl font-bold">
            {
              attendance.filter(
                (a) => a.status === "Present"
              ).length
            }
          </p>
        </div>

        <div className="bg-red-500 text-white rounded-xl p-5">
          <h3>Absent</h3>
          <p className="text-3xl font-bold">
            {
              attendance.filter(
                (a) => a.status === "Absent"
              ).length
            }
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5">
          <h3>Leave</h3>
          <p className="text-3xl font-bold">
            {
              attendance.filter(
                (a) => a.status === "Leave"
              ).length
            }
          </p>
        </div>

      </div>

      {/* Attendance Form */}
      <AttendanceForm
        addAttendance={addAttendance}
      />

      {/* Search */}
      <input
        type="text"
        placeholder="Search Employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"
      />

      {/* Attendance Table */}
      <AttendanceTable
        attendance={filteredAttendance}
        deleteAttendance={deleteAttendance}
      />

    </div>
  );
}

export default AttendancePage;