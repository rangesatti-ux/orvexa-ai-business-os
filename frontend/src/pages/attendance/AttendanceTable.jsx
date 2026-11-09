function AttendanceTable({
  attendance,
  getEmployeeName,
  loadingAttendance,
  employeeId,
}) {
  const formatTime = (time) => {
    if (!time) return "—";
    return String(time).substring(0, 8);
  };

  const formatWorkingHours = (hours) => {
    if (hours === null || hours === undefined) return "—";
    return `${Number(hours).toFixed(2)} hrs`;
  };

  return (
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
                  Loading attendance records...
                </td>
              </tr>
            ) : attendance.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-5 py-12 text-center text-gray-500 dark:text-slate-400"
                >
                  {employeeId
                    ? "No attendance records found for this employee."
                    : "No attendance records found."}
                </td>
              </tr>
            ) : (
              attendance.map((record) => (
                <tr
                  key={record.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-slate-700/40"
                >
                  <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                    #{record.id}
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {getEmployeeName(record.employee_id)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                      DB ID: {record.employee_id}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                    {record.attendance_date || "—"}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                    {formatTime(record.check_in)}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                    {formatTime(record.check_out)}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-slate-200">
                    {formatWorkingHours(record.working_hours)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        String(record.status).toLowerCase() === "present"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : String(record.status).toLowerCase() === "absent"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {record.status || "Unknown"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                    {record.remarks || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendanceTable;