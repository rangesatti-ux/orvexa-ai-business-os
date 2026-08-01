import { Pencil, Trash2 } from "lucide-react";

function LeaveTable({
  leaveData,
  deleteLeave,
  editLeave,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

      <table className="min-w-full">

        <thead className="bg-gray-100">

          <tr>
            <th className="p-4 text-left">Employee</th>
            <th className="p-4 text-left">Leave Type</th>
            <th className="p-4 text-left">From</th>
            <th className="p-4 text-left">To</th>
            <th className="p-4 text-left">Reason</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>

        </thead>

        <tbody>

          {leaveData.length === 0 ? (

            <tr>
              <td
                colSpan="7"
                className="text-center py-8 text-gray-500"
              >
                No Leave Records Found
              </td>
            </tr>

          ) : (

            leaveData.map((leave) => (

              <tr
                key={leave.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4 font-medium">
                  {leave.employee}
                </td>

                <td className="p-4">
                  {leave.type}
                </td>

                <td className="p-4">
                  {leave.from}
                </td>

                <td className="p-4">
                  {leave.to}
                </td>

                <td className="p-4">
                  {leave.reason}
                </td>

                <td className="p-4 text-center">

                  <span
                    className={`px-3 py-1 rounded-full text-sm text-white ${
                      leave.status === "Approved"
                        ? "bg-green-600"
                        : leave.status === "Rejected"
                        ? "bg-red-600"
                        : "bg-yellow-500"
                    }`}
                  >
                    {leave.status}
                  </span>

                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() => editLeave(leave)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => deleteLeave(leave.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

export default LeaveTable;