import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import PayrollForm from "./PayrollForm";
import PayrollTable from "./PayrollTable";

function PayrollPage() {
  const [payroll, setPayroll] = useState(() => {
    const saved = localStorage.getItem("payroll");

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "John Doe",
            department: "IT",
            basicSalary: 50000,
            bonus: 5000,
            deduction: 2000,
            netSalary: 53000,
          },
          {
            id: 2,
            name: "Alice",
            department: "HR",
            basicSalary: 45000,
            bonus: 3000,
            deduction: 1000,
            netSalary: 47000,
          },
        ];
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "payroll",
      JSON.stringify(payroll)
    );
  }, [payroll]);

  const addPayroll = (record) => {
    setPayroll((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...record,
      },
    ]);

    toast.success("Payroll Added Successfully");
  };

  const deletePayroll = (id) => {
    setPayroll((prev) =>
      prev.filter((record) => record.id !== id)
    );

    toast.error("Payroll Deleted");
  };

  const filteredPayroll = payroll.filter(
    (record) =>
      record.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      record.department
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const totalPayroll = payroll.reduce(
    (sum, record) => sum + record.netSalary,
    0
  );

  const totalBonus = payroll.reduce(
    (sum, record) => sum + record.bonus,
    0
  );

  const totalDeduction = payroll.reduce(
    (sum, record) => sum + record.deduction,
    0
  );

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Payroll Management
      </h1>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-blue-500 text-white rounded-xl p-5 shadow">
          <h3>Total Employees</h3>
          <p className="text-3xl font-bold">
            {payroll.length}
          </p>
        </div>

        <div className="bg-green-500 text-white rounded-xl p-5 shadow">
          <h3>Total Payroll</h3>
          <p className="text-3xl font-bold">
            ₹{totalPayroll.toLocaleString()}
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5 shadow">
          <h3>Total Bonus</h3>
          <p className="text-3xl font-bold">
            ₹{totalBonus.toLocaleString()}
          </p>
        </div>

        <div className="bg-red-500 text-white rounded-xl p-5 shadow">
          <h3>Total Deduction</h3>
          <p className="text-3xl font-bold">
            ₹{totalDeduction.toLocaleString()}
          </p>
        </div>

      </div>

      {/* Payroll Form */}

      <PayrollForm addPayroll={addPayroll} />

      {/* Search */}

      <input
        type="text"
        placeholder="Search Employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"
      />

      {/* Payroll Table */}

      <PayrollTable
        payroll={filteredPayroll}
        deletePayroll={deletePayroll}
      />

    </div>
  );
}

export default PayrollPage;