import { useState } from "react";

function EmployeeForm({ addEmployee }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !name ||
      !email ||
      !phone ||
      !department ||
      !designation
    ) {
      alert("Please fill all fields.");
      return;
    }

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">
          Employee Name
        </label>
        <input
          type="text"
          placeholder="Enter employee name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Phone Number
        </label>
        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Department
        </label>
        <input
          type="text"
          placeholder="Enter department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Designation
        </label>
        <input
          type="text"
          placeholder="Enter designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
      >
        Add Employee
      </button>
    </form>
  );
}

export default EmployeeForm;