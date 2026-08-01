import { useState } from "react";
import { toast } from "react-toastify";

import { exportToPDF } from "../../utils/exportPDF";
import { exportToExcel } from "../../utils/exportExcel";

function ReportsPage() {
  const [reports] = useState([
    {
      id: 1,
      report: "Employee Report",
      records: 120,
      updated: "2026-07-29",
      status: "Completed",
    },
    {
      id: 2,
      report: "Attendance Report",
      records: 115,
      updated: "2026-07-29",
      status: "Completed",
    },
    {
      id: 3,
      report: "Payroll Report",
      records: 120,
      updated: "2026-07-29",
      status: "Completed",
    },
    {
      id: 4,
      report: "Inventory Report",
      records: 75,
      updated: "2026-07-29",
      status: "Completed",
    },
    {
      id: 5,
      report: "Leave Report",
      records: 18,
      updated: "2026-07-29",
      status: "Pending",
    },
  ]);

  const [search, setSearch] = useState("");

  const filteredReports = reports.filter((item) =>
    item.report.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Reports Dashboard
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() => {
              exportToPDF(filteredReports, "Reports");
              toast.success("PDF exported successfully!");
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            📄 Export PDF
          </button>

          <button
            onClick={() => {
              exportToExcel(filteredReports, "Reports");
              toast.success("Excel exported successfully!");
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            📊 Export Excel
          </button>

        </div>

      </div>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="bg-blue-600 text-white rounded-xl p-5">
          <h3>Total Reports</h3>
          <p className="text-3xl font-bold">
            {reports.length}
          </p>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-5">
          <h3>Completed</h3>
          <p className="text-3xl font-bold">
            {reports.filter(r => r.status === "Completed").length}
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5">
          <h3>Pending</h3>
          <p className="text-3xl font-bold">
            {reports.filter(r => r.status === "Pending").length}
          </p>
        </div>

        <div className="bg-purple-600 text-white rounded-xl p-5">
          <h3>Total Records</h3>
          <p className="text-3xl font-bold">
            {reports.reduce((sum, r) => sum + r.records, 0)}
          </p>
        </div>

      </div>

      <input
        type="text"
        placeholder="Search Report..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 border rounded-lg p-3"
      />

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Report</th>
              <th className="p-4 text-center">Records</th>
              <th className="p-4 text-center">Last Updated</th>
              <th className="p-4 text-center">Status</th>
            </tr>

          </thead>

          <tbody>

            {filteredReports.length === 0 ? (

              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-500"
                >
                  No Reports Found
                </td>
              </tr>

            ) : (

              filteredReports.map((item) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4">{item.id}</td>

                  <td className="p-4 font-medium">
                    {item.report}
                  </td>

                  <td className="p-4 text-center">
                    {item.records}
                  </td>

                  <td className="p-4 text-center">
                    {item.updated}
                  </td>

                  <td className="p-4 text-center">

                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        item.status === "Completed"
                          ? "bg-green-600"
                          : "bg-yellow-500"
                      }`}
                    >
                      {item.status}
                    </span>

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

export default ReportsPage;