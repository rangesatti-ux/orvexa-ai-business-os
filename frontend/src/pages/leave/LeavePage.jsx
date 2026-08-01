import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import LeaveForm from "./LeaveForm";
import LeaveTable from "./LeaveTable";

function LeavePage() {
  const [leaveData, setLeaveData] = useState(() => {
    const saved = localStorage.getItem("leaveData");

    return saved
      ? JSON.parse(saved)
      : [
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
        ];
  });

  const [editingLeave, setEditingLeave] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "leaveData",
      JSON.stringify(leaveData)
    );
  }, [leaveData]);

  const addLeave = (leave) => {
    if (editingLeave) {
      setLeaveData((prev) =>
        prev.map((item) =>
          item.id === editingLeave.id
            ? { ...leave, id: editingLeave.id }
            : item
        )
      );

      toast.success("Leave Updated Successfully");
      setEditingLeave(null);
    } else {
      setLeaveData((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...leave,
        },
      ]);

      toast.success("Leave Added Successfully");
    }
  };

  const deleteLeave = (id) => {
    setLeaveData((prev) =>
      prev.filter((item) => item.id !== id)
    );

    toast.error("Leave Deleted");
  };

  const editLeave = (leave) => {
    setEditingLeave(leave);
  };

  const filteredLeave = leaveData.filter(
    (leave) =>
      leave.employee
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      leave.type
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      leave.status
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Leave Management
      </h1>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-blue-500 text-white rounded-xl p-5 shadow">
          <h3>Total Requests</h3>
          <p className="text-3xl font-bold">
            {leaveData.length}
          </p>
        </div>

        <div className="bg-green-500 text-white rounded-xl p-5 shadow">
          <h3>Approved</h3>
          <p className="text-3xl font-bold">
            {
              leaveData.filter(
                (item) => item.status === "Approved"
              ).length
            }
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5 shadow">
          <h3>Pending</h3>
          <p className="text-3xl font-bold">
            {
              leaveData.filter(
                (item) => item.status === "Pending"
              ).length
            }
          </p>
        </div>

        <div className="bg-red-500 text-white rounded-xl p-5 shadow">
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

      {/* Leave Form */}
      <LeaveForm
        addLeave={addLeave}
        editingLeave={editingLeave}
      />

      {/* Search */}
      <input
        type="text"
        placeholder="Search Leave..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"
      />

      {/* Leave Table */}
      <LeaveTable
        leaveData={filteredLeave}
        deleteLeave={deleteLeave}
        editLeave={editLeave}
      />

    </div>
  );
}

export default LeavePage;