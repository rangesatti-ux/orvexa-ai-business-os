import {
  Bell,
  Search,
  Moon,
  Sun,
  UserCircle,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";

function TopNavbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white dark:bg-slate-900 dark:text-white shadow px-6 py-4 flex items-center justify-between">

      {/* Search */}
      <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg px-4 py-2 w-96">
        <Search
          size={18}
          className="text-gray-500 dark:text-gray-300"
        />

        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none ml-3 w-full text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="hover:text-blue-600 transition"
        >
          {darkMode ? (
            <Sun size={22} />
          ) : (
            <Moon size={22} />
          )}
        </button>

        {/* Notifications */}
        <button className="relative hover:text-blue-600 transition">
          <Bell size={22} />

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <UserCircle
            size={34}
            className="text-blue-600"
          />

          <div>
            <h3 className="font-semibold">
              Admin
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-400">
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