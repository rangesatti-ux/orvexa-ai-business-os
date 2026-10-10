import { useEffect, useState } from "react";

function EmployeeForm({
  addEmployee,
  editingEmployee,
  isEditing,
}) {
  const [employeeId, setEmployeeId] =
    useState("");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [designation, setDesignation] =
    useState("");

  const [salary, setSalary] =
    useState("");

  const [joiningDate, setJoiningDate] =
    useState("");

  useEffect(() => {
    if (editingEmployee) {
      setEmployeeId(
        editingEmployee.employee_id ||
          editingEmployee.id ||
          ""
      );

      setName(
        editingEmployee.name ||
          editingEmployee.full_name ||
          ""
      );

      setEmail(
        editingEmployee.email || ""
      );

      setPhone(
        editingEmployee.phone || ""
      );

      setDepartment(
        editingEmployee.department || ""
      );

      setDesignation(
        editingEmployee.designation ||
          editingEmployee.position ||
          ""
      );

      setSalary(
        editingEmployee.salary ?? ""
      );

      setJoiningDate(
        editingEmployee.joining_date ||
          ""
      );
    } else {
      resetForm();
    }
  }, [editingEmployee]);

  const resetForm = () => {
    setEmployeeId("");
    setName("");
    setEmail("");
    setPhone("");
    setDepartment("");
    setDesignation("");
    setSalary("");
    setJoiningDate("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    addEmployee({
      employee_id: employeeId,
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joining_date: joiningDate,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">

      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {isEditing
          ? "Update Employee"
          : "Add Employee"}
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Employee ID */}
          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(event) =>
              setEmployeeId(
                event.target.value
              )
            }
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            required
            disabled={isEditing}
          />

          {/* Full Name */}
          <input
            type="text"
            placeholder="Employee Name"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            required
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            required
          />

          {/* Phone */}
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value
              )
            }
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            required
          />

          {/* Department */}
          <input
            type="text"
            placeholder="Department"
            value={department}
            onChange={(event) =>
              setDepartment(
                event.target.value
              )
            }
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            required
          />

          {/* Designation */}
          <input
            type="text"
            placeholder="Designation / Position"
            value={designation}
            onChange={(event) =>
              setDesignation(
                event.target.value
              )
            }
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            required
          />

          {/* Salary */}
          <input
            type="number"
            min="0"
            placeholder="Salary"
            value={salary}
            onChange={(event) =>
              setSalary(
                event.target.value
              )
            }
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            required
          />

          {/* Joining Date */}
          <input
            type="date"
            value={joiningDate}
            onChange={(event) =>
              setJoiningDate(
                event.target.value
              )
            }
            className="border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            required
          />

        </div>

        <div className="flex gap-3 mt-6">

          <button
            type="submit"
            className={`px-6 py-3 rounded-lg text-white ${
              isEditing
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isEditing
              ? "Update Employee"
              : "Add Employee"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
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