import {
  Bell,
  Search,
  Moon,
  UserCircle,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

function TopNavbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow px-6 py-4 flex items-center justify-between">

      {/* Search */}
      <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none ml-3 w-full"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Dark Mode */}
        <button className="hover:text-blue-600 transition">
          <Moon size={22} />
        </button>

        {/* Notifications */}
        <button className="relative hover:text-blue-600 transition">
          <Bell size={22} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button>

        {/* Admin */}
        <div className="flex items-center gap-2">
          <UserCircle size={34} className="text-blue-600" />

          <div>
            <h3 className="font-semibold">Admin</h3>
            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>
    </header>
  );
}

export default TopNavbar;