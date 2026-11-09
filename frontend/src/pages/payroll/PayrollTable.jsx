import { Pencil, Trash2 } from "lucide-react";

function PayrollTable({
  payroll,
  deletePayroll,
  editPayroll,
  employees = [],
}) {
  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => Number(e.id) === Number(employeeId));
    return emp?.full_name || emp?.name || `Employee #${employeeId}`;
  };

  const currency = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Employee</th>
              <th className="p-4">Month</th>
              <th className="p-4 text-right">Basic</th>
              <th className="p-4 text-right">HRA</th>
              <th className="p-4 text-right">Allowance</th>
              <th className="p-4 text-right">Bonus</th>
              <th className="p-4 text-right">Deduction</th>
              <th className="p-4 text-right">Net Salary</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {payroll.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-12 text-center text-gray-500 dark:text-slate-400">
                  No Payroll Records Found
                </td>
              </tr>
            ) : (
              payroll.map((record) => (
                <tr
                  key={record.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-slate-700/30"
                >
                  <td className="p-4 text-sm font-medium text-gray-800 dark:text-white">
                    #{record.id}
                  </td>

                  <td className="p-4 font-medium text-gray-900 dark:text-white">
                    {record.employee_name || getEmployeeName(record.employee_id)}
                  </td>

                  <td className="p-4 text-sm text-gray-600 dark:text-slate-300">
                    {record.month || "—"}
                  </td>

                  <td className="p-4 text-right text-sm text-gray-700 dark:text-slate-300">
                    {currency(record.basic_salary)}
                  </td>

                  <td className="p-4 text-right text-sm text-gray-700 dark:text-slate-300">
                    {currency(record.hra)}
                  </td>

                  <td className="p-4 text-right text-sm text-gray-700 dark:text-slate-300">
                    {currency(record.allowance)}
                  </td>

                  <td className="p-4 text-right text-sm font-semibold text-green-600 dark:text-green-400">
                    {currency(record.bonus)}
                  </td>

                  <td className="p-4 text-right text-sm font-semibold text-red-600 dark:text-red-400">
                    {currency(record.deduction)}
                  </td>

                  <td className="p-4 text-right text-sm font-bold text-blue-600 dark:text-blue-400">
                    {currency(record.net_salary)}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      {editPayroll && (
                        <button
                          type="button"
                          onClick={() => editPayroll(record)}
                          className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700"
                          title="Edit payroll"
                        >
                          <Pencil size={18} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deletePayroll(record.id)}
                        className="rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700"
                        title="Delete payroll"
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
    </div>
  );
}

export default PayrollTable;