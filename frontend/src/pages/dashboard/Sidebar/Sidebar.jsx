import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Wallet,
  Package,
  FileText,
  Settings,
  Bot,
  User,
  Bell,
  CalendarDays,
  Building2,
  ClipboardList,
  BarChart3,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

function Sidebar() {
  const { user } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      roles: ["admin", "hr", "employee"],
    },
    {
      name: "Employees",
      path: "/employees",
      icon: Users,
      roles: ["admin", "hr"],
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: CalendarCheck,
      roles: ["admin", "hr", "employee"],
    },
    {
      name: "Leave",
      path: "/leave",
      icon: CalendarDays,
      roles: ["admin", "hr", "employee"],
    },
    {
      name: "Payroll",
      path: "/payroll",
      icon: Wallet,
      roles: ["admin", "hr"],
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: Package,
      roles: ["admin"],
    },
    {
      name: "Departments",
      path: "/departments",
      icon: Building2,
      roles: ["admin"],
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: ClipboardList,
      roles: ["admin", "employee"],
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileText,
      roles: ["admin", "hr"],
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      name: "AI Assistant",
      path: "/assistant",
      icon: Bot,
      roles: ["admin"],
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell,
      roles: ["admin", "hr", "employee"],
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
      roles: ["admin", "hr", "employee"],
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white shadow-lg flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-3xl font-bold text-blue-400">
          Orvexa AI
        </h1>

        <p className="text-sm text-slate-400">
          Business Operating System
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-5 px-3">

        {menuItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* Logged User */}
      <div className="border-t border-slate-700 p-4">
        <p className="text-sm font-semibold">
          {user?.name}
        </p>

        <p className="text-xs text-slate-400 uppercase">
          {user?.role}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 p-4">
        © 2026 Orvexa AI
      </div>

    </aside>
  );
}

export default Sidebar;