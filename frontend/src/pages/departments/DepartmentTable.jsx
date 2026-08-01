import { Pencil, Trash2 } from "lucide-react";

function DepartmentTable({
  departments,
  deleteDepartment,
  editDepartment,
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>
            <th className="p-4 text-left">Department</th>
            <th className="p-4 text-left">Head</th>
            <th className="p-4 text-left">Location</th>
            <th className="p-4 text-left">Employees</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>

        </thead>

        <tbody>

          {departments.map((department) => (

            <tr
              key={department.id}
              className="border-t hover:bg-gray-50"
            >

              <td className="p-4">{department.name}</td>
              <td className="p-4">{department.head}</td>
              <td className="p-4">{department.location}</td>
              <td className="p-4">{department.employees}</td>

              <td className="p-4">

                <span
                  className={`px-3 py-1 rounded-full text-white ${
                    department.status === "Active"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {department.status}
                </span>

              </td>

              <td className="p-4 flex justify-center gap-3">

                <button
                  onClick={() => editDepartment(department)}
                  className="bg-blue-600 text-white p-2 rounded-lg"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => deleteDepartment(department.id)}
                  className="bg-red-600 text-white p-2 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default DepartmentTable;