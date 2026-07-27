import { useState, useEffect } from "react";

function EmployeeForm({ addEmployee, selectedEmployee }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (selectedEmployee) {
      setName(selectedEmployee.name);
      setEmail(selectedEmployee.email);
    }
  }, [selectedEmployee]);

  const handleSubmit = (e) => {
    e.preventDefault();

    addEmployee({
      name,
      email,
    });

    alert("Employee Added Successfully!");

    setName("");
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Employee Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="email"
        placeholder="Employee Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <button type="submit">
        {selectedEmployee ? "Update Employee" : "Add Employee"}
      </button>
    </form>
  );
}

export default EmployeeForm;