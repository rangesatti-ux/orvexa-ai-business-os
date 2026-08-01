import { Pencil, Trash2 } from "lucide-react";

function PayrollTable({
  payroll,
  deletePayroll,
  editPayroll,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

      <table className="min-w-full">

        <thead className="bg-gray-100">

          <tr>
            <th className="p-4 text-left">ID</th>
            <th className="p-4 text-left">Employee</th>
            <th className="p-4 text-left">Department</th>
            <th className="p-4 text-right">Basic Salary</th>
            <th className="p-4 text-right">Bonus</th>
            <th className="p-4 text-right">Deduction</th>
            <th className="p-4 text-right">Net Salary</th>
            <th className="p-4 text-center">Actions</th>
          </tr>

        </thead>

        <tbody>

          {payroll.length === 0 ? (

            <tr>

              <td
                colSpan="8"
                className="text-center py-8 text-gray-500"
              >
                No Payroll Records Found
              </td>

            </tr>

          ) : (

            payroll.map((record) => (

              <tr
                key={record.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">{record.id}</td>

                <td className="p-4 font-medium">
                  {record.name}
                </td>

                <td className="p-4">
                  {record.department}
                </td>

                <td className="p-4 text-right">
                  ₹{Number(record.basicSalary).toLocaleString()}
                </td>

                <td className="p-4 text-right text-green-600 font-semibold">
                  ₹{Number(record.bonus).toLocaleString()}
                </td>

                <td className="p-4 text-right text-red-600 font-semibold">
                  ₹{Number(record.deduction).toLocaleString()}
                </td>

                <td className="p-4 text-right font-bold text-blue-600">
                  ₹{Number(record.netSalary).toLocaleString()}
                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() => editPayroll(record)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => deletePayroll(record.id)}
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

export default PayrollTable;