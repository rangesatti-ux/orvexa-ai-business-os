import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function EmployeeForm({
  addEmployee,
  editingEmployee,
  isEditing,
}) {
  const { user } = useAuth();
  const userRole = user?.role ? user.role.toLowerCase() : "employee";
  
  // Per rules: Managers cannot add or modify employees (Admin and HR only)
  const canManageEmployees = ["admin", "hr"].includes(userRole);

  const [employeeId, setEmployeeId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState("Employee");
  const [salary, setSalary] = useState("");
  
  // Automatically default to today's date (YYYY-MM-DD)
  const [joiningDate, setJoiningDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (!canManageEmployees) return;

    if (editingEmployee && isEditing) {
      setEmployeeId(
        editingEmployee.employee_id || editingEmployee.id || ""
      );

      // Split full name if present
      const fullName = editingEmployee.name || editingEmployee.full_name || "";
      const nameParts = fullName.trim().split(" ");
      setFirstName(editingEmployee.first_name || nameParts[0] || "");
      setLastName(editingEmployee.last_name || nameParts.slice(1).join(" ") || "");

      setEmail(editingEmployee.email || "");
      setPhone(editingEmployee.phone || "");
      setDepartment(editingEmployee.department || "");
      setDepartmentId(editingEmployee.department_id || "");
      setDesignation(
        editingEmployee.designation || editingEmployee.position || ""
      );
      setRole(editingEmployee.role || "Employee");
      setSalary(editingEmployee.salary ?? "");
      setJoiningDate(editingEmployee.joining_date || new Date().toISOString().split("T")[0]);
      setPassword(""); // Password is not editable from employee form
    } else {
      resetForm();
    }
  }, [editingEmployee, isEditing, canManageEmployees]);

  const resetForm = () => {
    setEmployeeId("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setDepartment("");
    setDepartmentId("");
    setDesignation("");
    setRole("Employee");
    setSalary("");
    setJoiningDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!canManageEmployees) {
      alert("Unauthorized: Managers do not have permission to add or edit employees.");
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    addEmployee({
      employee_id: employeeId.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      name: fullName,
      full_name: fullName,
      email: email.trim(),
      password: isEditing ? undefined : password,
      phone: phone.trim(),
      department: department.trim(),
      department_id: departmentId ? Number(departmentId) : undefined,
      designation: designation.trim(),
      role: role,
      salary: salary !== "" ? Number(salary) : 0,
      joining_date: joiningDate || new Date().toISOString().split("T")[0],
    });
  };

  if (!canManageEmployees) {
    return null; // Hidden for Managers & Employees
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {isEditing ? "Update Employee" : "Add Employee"}
      </h2>

      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Hidden dummy fields to prevent browser auto-fill mapping */}
        <input type="text" name="fake_username_remember" style={{ display: "none" }} autoComplete="username" />
        <input type="password" name="fake_password_remember" style={{ display: "none" }} autoComplete="current-password" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee ID */}
          <input
            type="text"
            placeholder="Employee Code / ID (e.g. EMP-DEV01)"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isEditing}
            autoComplete="off"
          />

          {/* First Name */}
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="off"
          />

          {/* Last Name */}
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="off"
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Work Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="off"
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
              autoComplete="new-password"
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
            autoComplete="off"
          />

          {/* Department */}
          <input
            type="text"
            placeholder="Department (e.g. Engineering, HR)"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="off"
          />

          {/* Designation / Position */}
          <input
            type="text"
            placeholder="Designation / Position"
            value={designation}
            onChange={(event) => setDesignation(event.target.value)}
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="off"
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
            autoComplete="off"
          />

          {/* Joining Date (Defaults to present day automatically) */}
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