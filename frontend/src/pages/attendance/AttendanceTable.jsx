function AttendanceTable({
  attendance = [],
  getEmployeeName,
  loadingAttendance,
  employeeId,
}) {
  const formatTime = (time) => {
    if (!time) return "—";
    
    // Handle ISO string or timestamp
    if (String(time).includes("T") || String(time).includes("-")) {
      const dateObj = new Date(time);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    }
    return String(time).substring(0, 8);
  };

  const formatWorkingHours = (hours, checkIn, checkOut) => {
    if (hours !== null && hours !== undefined && hours !== "") {
      const numHours = Number(hours);
      if (!isNaN(numHours)) return `${numHours.toFixed(2)} hrs`;
    }

    // Auto-calculate fallback if check-in and check-out exist
    if (checkIn && checkOut) {
      const start = new Date(checkIn).getTime();
      const end = new Date(checkOut).getTime();
      if (!isNaN(start) && !isNaN(end) && end > start) {
        const diffHrs = (end - start) / (1000 * 60 * 60);
        return `${diffHrs.toFixed(2)} hrs`;
      }
    }

    return "—";
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-left">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-900">
            <tr>
              <th className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                Record ID
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
              attendance.map((record) => {
                const statusLower = String(record.status || "").toLowerCase();
                const checkInVal = record.check_in || record.time_in;
                const checkOutVal = record.check_out || record.time_out;
                const dateVal =
                  record.attendance_date ||
                  record.date ||
                  (record.created_at ? record.created_at.split("T")[0] : "—");

                let statusBadgeStyle = "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300";
                if (statusLower === "present") {
                  statusBadgeStyle = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
                } else if (statusLower === "absent") {
                  statusBadgeStyle = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
                } else if (statusLower === "leave") {
                  statusBadgeStyle = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
                } else if (statusLower === "half day") {
                  statusBadgeStyle = "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
                }

                return (
                  <tr
                    key={record.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-slate-700/40"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                      #{record.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {getEmployeeName ? getEmployeeName(record.employee_id) : `Employee #${record.employee_id}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                        EMP ID: #{record.employee_id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                      {dateVal}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                      {formatTime(checkInVal)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                      {formatTime(checkOutVal)}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-slate-200">
                      {formatWorkingHours(record.working_hours, checkInVal, checkOutVal)}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyle}`}>
                        {record.status || "Unknown"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                      {record.remarks || "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendanceTable;