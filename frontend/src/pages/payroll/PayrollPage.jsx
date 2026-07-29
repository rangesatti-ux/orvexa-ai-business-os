import { useState } from "react";
import { toast } from "react-toastify";

import PayrollForm from "./PayrollForm";
import PayrollTable from "./PayrollTable";

import { exportToPDF } from "../../utils/exportPDF";
import { exportToExcel } from "../../utils/exportExcel";

function PayrollPage() {
  const [payroll, setPayroll] = useState([
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
  ]);

  const [search, setSearch] = useState("");
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const savePayroll = (record) => {
    if (isEditing) {
      setPayroll((prev) =>
        prev.map((item) =>
          item.id === editingPayroll.id
            ? { ...record, id: editingPayroll.id }
            : item
        )
      );

      toast.success("Payroll updated successfully!");

      setEditingPayroll(null);
      setIsEditing(false);
    } else {
      setPayroll((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...record,
        },
      ]);

      toast.success("Payroll added successfully!");
    }
  };

  const deletePayroll = (id) => {
    setPayroll((prev) => prev.filter((item) => item.id !== id));

    toast.error("Payroll deleted successfully!");
  };

  const editPayroll = (record) => {
    setEditingPayroll(record);
    setIsEditing(true);
  };

  const filteredPayroll = payroll.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = payroll.reduce(
    (sum, item) => sum + Number(item.netSalary),
    0
  );

  const totalBonus = payroll.reduce(
    (sum, item) => sum + Number(item.bonus),
    0
  );

  const totalDeduction = payroll.reduce(
    (sum, item) => sum + Number(item.deduction),
    0
  );

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Payroll Management
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() =>
              exportToPDF(filteredPayroll, "Payroll_Report")
            }
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            📄 Export PDF
          </button>

          <button
            onClick={() =>
              exportToExcel(filteredPayroll, "Payroll_Report")
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            📊 Export Excel
          </button>

        </div>

      </div>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-blue-600 text-white rounded-xl p-5">
          <h3>Total Employees</h3>
          <p className="text-3xl font-bold">
            {payroll.length}
          </p>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-5">
          <h3>Total Payroll</h3>
          <p className="text-3xl font-bold">
            ₹{totalPayroll.toLocaleString()}
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5">
          <h3>Total Bonus</h3>
          <p className="text-3xl font-bold">
            ₹{totalBonus.toLocaleString()}
          </p>
        </div>

        <div className="bg-red-600 text-white rounded-xl p-5">
          <h3>Total Deduction</h3>
          <p className="text-3xl font-bold">
            ₹{totalDeduction.toLocaleString()}
          </p>
        </div>

      </div>

      <PayrollForm
        savePayroll={savePayroll}
        editingPayroll={editingPayroll}
        isEditing={isEditing}
      />

      <input
        type="text"
        placeholder="Search Employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 border rounded-lg p-3"
      />

      <PayrollTable
        payroll={filteredPayroll}
        deletePayroll={deletePayroll}
        editPayroll={editPayroll}
      />

    </div>
  );
}

export default PayrollPage;