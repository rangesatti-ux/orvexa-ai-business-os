function Sidebar() {
  return (
    <div className="w-64 h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-8">
        ORVEXA
      </h1>

      <ul className="space-y-4">
        <li className="hover:text-blue-400 cursor-pointer">Dashboard</li>
        <li className="hover:text-blue-400 cursor-pointer">Employees</li>
        <li className="hover:text-blue-400 cursor-pointer">Attendance</li>
        <li className="hover:text-blue-400 cursor-pointer">Payroll</li>
        <li className="hover:text-blue-400 cursor-pointer">Inventory</li>
        <li className="hover:text-blue-400 cursor-pointer">Settings</li>
      </ul>
    </div>
  );
}

export default Sidebar;