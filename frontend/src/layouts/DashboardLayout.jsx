import { Outlet } from "react-router-dom";

import Sidebar from "../pages/dashboard/Sidebar/Sidebar";
import TopNavbar from "../pages/dashboard/TopNavbar/TopNavbar";

function DashboardLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Application Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNavbar />

        <main className="min-w-0 flex-1 overflow-y-auto bg-gray-100 dark:bg-slate-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;