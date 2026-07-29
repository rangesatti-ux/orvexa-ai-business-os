import { useState } from "react";
import { toast } from "react-toastify";

import LeaveForm from "./LeaveForm";
import LeaveTable from "./LeaveTable";

import { exportToPDF } from "../../utils/exportPDF";
import { exportToExcel } from "../../utils/exportExcel";

function LeavePage() {
  const [leaveData, setLeaveData] = useState([
    {
      id: 1,
      employee: "John",
      type: "Sick Leave",
      from: "2026-08-10",
      to: "2026-08-12",
      reason: "Fever",
      status: "Approved",
    },
    {
      id: 2,
      employee: "Rahul",
      type: "Casual Leave",
      from: "2026-08-15",
      to: "2026-08-16",
      reason: "Family Function",
      status: "Pending",
    },
  ]);

  const [editingLeave, setEditingLeave] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");

  const saveLeave = (leave) => {
    if (isEditing) {
      setLeaveData((prev) =>
        prev.map((item) =>
          item.id === editingLeave.id
            ? { ...leave, id: editingLeave.id }
            : item
        )
      );

      toast.success("Leave updated successfully!");

      setEditingLeave(null);
      setIsEditing(false);
    } else {
      setLeaveData((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...leave,
        },
      ]);

      toast.success("Leave added successfully!");
    }
  };

  const deleteLeave = (id) => {
    setLeaveData((prev) =>
      prev.filter((item) => item.id !== id)
    );

    toast.error("Leave deleted successfully!");
  };

  const editLeave = (leave) => {
    setEditingLeave(leave);
    setIsEditing(true);
  };

  const filteredLeave = leaveData.filter(
    (leave) =>
      leave.employee.toLowerCase().includes(search.toLowerCase()) ||
      leave.type.toLowerCase().includes(search.toLowerCase()) ||
      leave.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Leave Management
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() =>
              exportToPDF(filteredLeave, "Leave_Report")
            }
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            📄 Export PDF
          </button>

          <button
            onClick={() =>
              exportToExcel(filteredLeave, "Leave_Report")
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
          <h3>Total Requests</h3>
          <p className="text-3xl font-bold">
            {leaveData.length}
          </p>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-5">
          <h3>Approved</h3>
          <p className="text-3xl font-bold">
            {
              leaveData.filter(
                (item) => item.status === "Approved"
              ).length
            }
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5">
          <h3>Pending</h3>
          <p className="text-3xl font-bold">
            {
              leaveData.filter(
                (item) => item.status === "Pending"
              ).length
            }
          </p>
        </div>

        <div className="bg-red-600 text-white rounded-xl p-5">
          <h3>Rejected</h3>
          <p className="text-3xl font-bold">
            {
              leaveData.filter(
                (item) => item.status === "Rejected"
              ).length
            }
          </p>
        </div>

      </div>

      <input
        type="text"
        placeholder="Search Leave..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 border rounded-lg p-3"
      />

      <LeaveForm
        saveLeave={saveLeave}
        editingLeave={editingLeave}
        isEditing={isEditing}
      />

      <LeaveTable
        leaveData={filteredLeave}
        deleteLeave={deleteLeave}
        editLeave={editLeave}
      />

    </div>
  );
}

export default LeavePage;