import { useEffect, useState } from "react";

function EmployeeForm({
  addEmployee,
  editingEmployee,
  isEditing,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  useEffect(() => {
    if (editingEmployee) {
      setName(editingEmployee.name);
      setEmail(editingEmployee.email);
      setPhone(editingEmployee.phone);
      setDepartment(editingEmployee.department);
      setDesignation(editingEmployee.designation);
    }
  }, [editingEmployee]);

  const handleSubmit = (e) => {
    e.preventDefault();

    addEmployee({
      name,
      email,
      phone,
      department,
      designation,
    });

    setName("");
    setEmail("");
    setPhone("");
    setDepartment("");
    setDesignation("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">

      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Update Employee" : "Add Employee"}
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Employee Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="border p-3 rounded-lg md:col-span-2"
            required
          />

        </div>

        <button
          type="submit"
          className={`mt-6 px-6 py-3 rounded-lg text-white ${
            isEditing
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isEditing ? "Update Employee" : "Add Employee"}
        </button>

      </form>

    </div>
  );
}

export default EmployeeForm;