import { useState } from "react";
import { toast } from "react-toastify";

import AttendanceForm from "./AttendanceForm";
import AttendanceTable from "./AttendanceTable";

import { exportToPDF } from "../../utils/exportPDF";
import { exportToExcel } from "../../utils/exportExcel";

function AttendancePage() {
  const [attendance, setAttendance] = useState([
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
  ]);

  const [search, setSearch] = useState("");
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const saveAttendance = (record) => {
    if (isEditing) {
      setAttendance((prev) =>
        prev.map((item) =>
          item.id === editingAttendance.id
            ? { ...record, id: editingAttendance.id }
            : item
        )
      );

      toast.success("Attendance updated successfully!");

      setEditingAttendance(null);
      setIsEditing(false);
    } else {
      setAttendance((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...record,
        },
      ]);

      toast.success("Attendance added successfully!");
    }
  };

  const deleteAttendance = (id) => {
    setAttendance((prev) =>
      prev.filter((item) => item.id !== id)
    );

    toast.error("Attendance deleted successfully!");
  };

  const editAttendance = (record) => {
    setEditingAttendance(record);
    setIsEditing(true);
  };

  const filteredAttendance = attendance.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase()) ||
      item.status.toLowerCase().includes(search.toLowerCase())
  );

  const totalEmployees = attendance.length;
  const present = attendance.filter(
    (item) => item.status === "Present"
  ).length;
  const absent = attendance.filter(
    (item) => item.status === "Absent"
  ).length;
  const leave = attendance.filter(
    (item) => item.status === "Leave"
  ).length;

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Attendance Management
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() =>
              exportToPDF(filteredAttendance, "Attendance_Report")
            }
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            📄 Export PDF
          </button>

          <button
            onClick={() =>
              exportToExcel(filteredAttendance, "Attendance_Report")
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            📊 Export Excel
          </button>

        </div>

      </div>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="bg-blue-600 text-white rounded-xl p-5">
          <h3>Total Employees</h3>
          <p className="text-3xl font-bold">
            {totalEmployees}
          </p>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-5">
          <h3>Present</h3>
          <p className="text-3xl font-bold">
            {present}
          </p>
        </div>

        <div className="bg-red-600 text-white rounded-xl p-5">
          <h3>Absent</h3>
          <p className="text-3xl font-bold">
            {absent}
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5">
          <h3>Leave</h3>
          <p className="text-3xl font-bold">
            {leave}
          </p>
        </div>

      </div>

      <AttendanceForm
        saveAttendance={saveAttendance}
        editingAttendance={editingAttendance}
        isEditing={isEditing}
      />

      <input
        type="text"
        placeholder="Search Employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 border rounded-lg p-3"
      />

      <AttendanceTable
        attendance={filteredAttendance}
        deleteAttendance={deleteAttendance}
        editAttendance={editAttendance}
      />

    </div>
  );
}

export default AttendancePage;