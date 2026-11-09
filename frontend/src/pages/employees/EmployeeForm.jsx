import { useEffect, useState } from "react";

function EmployeeForm({
  addEmployee,
  editingEmployee,
  isEditing,
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState("Employee");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");

  useEffect(() => {
    if (editingEmployee) {
      setEmployeeId(
        editingEmployee.employee_id || editingEmployee.id || ""
      );
      setName(
        editingEmployee.name || editingEmployee.full_name || ""
      );
      setEmail(editingEmployee.email || "");
      setPhone(editingEmployee.phone || "");
      setDepartment(editingEmployee.department || "");
      setDesignation(
        editingEmployee.designation || editingEmployee.position || ""
      );
      setRole(editingEmployee.role || "Employee");
      setSalary(editingEmployee.salary ?? "");
      setJoiningDate(editingEmployee.joining_date || "");
      setPassword(""); // Password is not editable from employee form
    } else {
      resetForm();
    }
  }, [editingEmployee]);

  const resetForm = () => {
    setEmployeeId("");
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setDepartment("");
    setDesignation("");
    setRole("Employee");
    setSalary("");
    setJoiningDate("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    addEmployee({
      employee_id: employeeId,
      name,
      email,
      password: isEditing ? undefined : password,
      phone,
      department,
      designation,
      role,
      salary,
      joining_date: joiningDate,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {isEditing ? "Update Employee" : "Add Employee"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee ID */}
          <input
            type="text"
            placeholder="Employee ID (e.g. EMP-DEV01)"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isEditing}
          />

          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Work Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Account Password (Required when creating new employee) */}
          {!isEditing && (
            <input
              type="password"
              placeholder="Account Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}

          {/* Phone */}
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Department */}
          <input
            type="text"
            placeholder="Department (e.g. Engineering, HR)"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Designation / Position */}
          <input
            type="text"
            placeholder="Designation / Position"
            value={designation}
            onChange={(event) => setDesignation(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Role Selection */}
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="HR">HR</option>
            <option value="Admin">Admin</option>
          </select>

          {/* Salary */}
          <input
            type="number"
            min="0"
            placeholder="Salary"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Joining Date */}
          <input
            type="date"
            value={joiningDate}
            onChange={(event) => setJoiningDate(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
              isEditing
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isEditing ? "Update Employee" : "Add Employee"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold transition"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;