import { useState, useEffect } from "react";

function PayrollForm({
  savePayroll,
  editingPayroll,
  isEditing,
}) {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    basicSalary: "",
    bonus: "",
    deduction: "",
  });

  useEffect(() => {
    if (editingPayroll) {
      setFormData({
        name: editingPayroll.name,
        department: editingPayroll.department,
        basicSalary: editingPayroll.basicSalary,
        bonus: editingPayroll.bonus,
        deduction: editingPayroll.deduction,
      });
    }
  }, [editingPayroll]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const basic = Number(formData.basicSalary);
    const bonus = Number(formData.bonus);
    const deduction = Number(formData.deduction);

    if (!formData.name || !formData.department) {
      alert("Please fill all fields.");
      return;
    }

    savePayroll({
      name: formData.name,
      department: formData.department,
      basicSalary: basic,
      bonus,
      deduction,
      netSalary: basic + bonus - deduction,
    });

    setFormData({
      name: "",
      department: "",
      basicSalary: "",
      bonus: "",
      deduction: "",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Update Payroll" : "Add Payroll"}
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="grid md:grid-cols-2 gap-5">

          <input
            type="text"
            name="name"
            placeholder="Employee Name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="number"
            name="basicSalary"
            placeholder="Basic Salary"
            value={formData.basicSalary}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="number"
            name="bonus"
            placeholder="Bonus"
            value={formData.bonus}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="number"
            name="deduction"
            placeholder="Deduction"
            value={formData.deduction}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <div className="flex items-center bg-gray-100 rounded-lg p-3">
            <span className="font-semibold">
              Net Salary:
            </span>

            <span className="ml-2 text-green-600 font-bold text-lg">
              ₹
              {(
                Number(formData.basicSalary || 0) +
                Number(formData.bonus || 0) -
                Number(formData.deduction || 0)
              ).toLocaleString()}
            </span>
          </div>

        </div>

        <button
          type="submit"
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          {isEditing ? "Update Payroll" : "Add Payroll"}
        </button>

      </form>

    </div>
  );
}

export default PayrollForm;