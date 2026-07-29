import { useState } from "react";
import DepartmentForm from "./DepartmentForm";
import DepartmentTable from "./DepartmentTable";

function DepartmentPage() {
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: "Human Resources",
      head: "Alice",
      location: "Hyderabad",
      employees: 15,
      status: "Active",
    },
    {
      id: 2,
      name: "IT",
      head: "Rahul",
      location: "Bangalore",
      employees: 32,
      status: "Active",
    },
  ]);

  const [editingDepartment, setEditingDepartment] = useState(null);

  const saveDepartment = (department) => {
    if (editingDepartment) {
      setDepartments(
        departments.map((d) =>
          d.id === editingDepartment.id
            ? { ...department, id: editingDepartment.id }
            : d
        )
      );
      setEditingDepartment(null);
    } else {
      setDepartments([...departments, { ...department, id: Date.now() }]);
    }
  };

  const deleteDepartment = (id) => {
    setDepartments(departments.filter((d) => d.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Department Management</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <div className="bg-blue-600 text-white rounded-xl p-5">
          <h2>Total Departments</h2>
          <p className="text-3xl font-bold">{departments.length}</p>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-5">
          <h2>Active</h2>
          <p className="text-3xl font-bold">
            {departments.filter((d) => d.status === "Active").length}
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5">
          <h2>Department Heads</h2>
          <p className="text-3xl font-bold">{departments.length}</p>
        </div>

        <div className="bg-purple-600 text-white rounded-xl p-5">
          <h2>Total Employees</h2>
          <p className="text-3xl font-bold">
            {departments.reduce((sum, d) => sum + Number(d.employees), 0)}
          </p>
        </div>

      </div>

      <DepartmentForm
        saveDepartment={saveDepartment}
        editingDepartment={editingDepartment}
      />

      <DepartmentTable
        departments={departments}
        deleteDepartment={deleteDepartment}
        editDepartment={setEditingDepartment}
      />
    </div>
  );
}

export default DepartmentPage;