import { Pencil, Trash2 } from "lucide-react";

function AttendanceTable({
  attendance,
  deleteAttendance,
  editAttendance,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

      <table className="min-w-full">

        <thead className="bg-gray-100">

          <tr>
            <th className="p-4 text-left">ID</th>
            <th className="p-4 text-left">Employee</th>
            <th className="p-4 text-left">Department</th>
            <th className="p-4 text-left">Date</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>

        </thead>

        <tbody>

          {attendance.length === 0 ? (

            <tr>
              <td
                colSpan="6"
                className="text-center py-8 text-gray-500"
              >
                No Attendance Records Found
              </td>
            </tr>

          ) : (

            attendance.map((record) => (

              <tr
                key={record.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {record.id}
                </td>

                <td className="p-4 font-medium">
                  {record.name}
                </td>

                <td className="p-4">
                  {record.department}
                </td>

                <td className="p-4">
                  {record.date}
                </td>

                <td className="p-4 text-center">

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                      record.status === "Present"
                        ? "bg-green-600"
                        : record.status === "Absent"
                        ? "bg-red-600"
                        : record.status === "Leave"
                        ? "bg-yellow-500"
                        : "bg-blue-600"
                    }`}
                  >
                    {record.status}
                  </span>

                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() => editAttendance(record)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => deleteAttendance(record.id)}
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

export default AttendanceTable;