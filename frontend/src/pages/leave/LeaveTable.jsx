import { Pencil, Trash2, Check, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function LeaveTable({
  leaveData = [],
  deleteLeave,
  editLeave,
  updateStatus,
  getEmployeeName,
}) {
  const { user } = useAuth();
  const userRole = user?.role ? user.role.toLowerCase() : "employee";

  // Helper to determine if current user can approve a target leave based on the applicant's role
  const canApproveTarget = (targetRole) => {
    const role = String(targetRole || "").toLowerCase();
    if (userRole === "admin") return true; // Admin can approve anyone
    if (userRole === "hr") return ["manager", "employee"].includes(role); // HR can approve managers & employees
    if (userRole === "manager") return ["employee", "manager"].includes(role); // Manager can approve team members
    return false;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-x-auto border border-gray-200 dark:border-slate-700">
      <table className="min-w-full text-left border-collapse">
        <thead className="bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
          <tr>
            <th className="p-4 font-semibold text-gray-700 dark:text-slate-300">Employee</th>
            <th className="p-4 font-semibold text-gray-700 dark:text-slate-300">Leave Type</th>
            <th className="p-4 font-semibold text-gray-700 dark:text-slate-300">From</th>
            <th className="p-4 font-semibold text-gray-700 dark:text-slate-300">To</th>
            <th className="p-4 font-semibold text-gray-700 dark:text-slate-300">Reason</th>
            <th className="p-4 text-center font-semibold text-gray-700 dark:text-slate-300">Status</th>
            <th className="p-4 text-center font-semibold text-gray-700 dark:text-slate-300">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {leaveData.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                className="text-center py-8 text-gray-500 dark:text-slate-400"
              >
                No Leave Records Found
              </td>
            </tr>
          ) : (
            leaveData.map((leave) => {
              const targetRole = leave.employee_role || leave.role || "employee";
              const showApprovalButtons =
                updateStatus &&
                canApproveTarget(targetRole) &&
                String(leave.status).toLowerCase() === "pending";

              const displayName = getEmployeeName
                ? getEmployeeName(leave.employee_id)
                : leave.employee || leave.employee_name || `Employee #${leave.employee_id || leave.id}`;

              return (
                <tr
                  key={leave.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition"
                >
                  <td className="p-4 font-medium text-gray-800 dark:text-white">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {displayName}
                      </p>
                      {leave.employee_id && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                          EMP #{leave.employee_id}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-gray-700 dark:text-slate-300">
                    {leave.leave_type || leave.type || "—"}
                  </td>

                  <td className="p-4 text-gray-600 dark:text-slate-300">
                    {leave.start_date || leave.from || "—"}
                  </td>

                  <td className="p-4 text-gray-600 dark:text-slate-300">
                    {leave.end_date || leave.to || "—"}
                  </td>

                  <td className="p-4 text-gray-600 dark:text-slate-300 max-w-xs truncate">
                    {leave.reason || "—"}
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        String(leave.status).toLowerCase() === "approved"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : String(leave.status).toLowerCase() === "rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {leave.status || "Pending"}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center items-center gap-2">
                      {/* Approval / Rejection Quick Actions */}
                      {showApprovalButtons && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateStatus(leave.id, "Approved", leave.employee_id)}
                            title="Approve"
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition shadow"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(leave.id, "Rejected", leave.employee_id)}
                            title="Reject"
                            className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg transition shadow"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}

                      {editLeave && userRole !== "admin" && (
                        <button
                          type="button"
                          onClick={() => editLeave(leave)}
                          title="Edit"
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                        >
                          <Pencil size={16} />
                        </button>
                      )}

                      {deleteLeave && (
                        <button
                          type="button"
                          onClick={() => deleteLeave(leave.id)}
                          title="Delete"
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LeaveTable;