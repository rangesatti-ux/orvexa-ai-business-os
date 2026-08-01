import { Outlet } from "react-router-dom";
import Sidebar from "../pages/dashboard/Sidebar/Sidebar";
import TopNavbar from "../pages/dashboard/TopNavbar/TopNavbar";

function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;