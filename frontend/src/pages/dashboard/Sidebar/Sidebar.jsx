import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Wallet,
  Package,
  FileText,
  Settings,
} from "lucide-react";
import { Bot } from "lucide-react";
import { User } from "lucide-react";
import { Bell } from "lucide-react";
import { CalendarDays } from "lucide-react";
import { Building2 } from "lucide-react";
import { ClipboardList } from "lucide-react";
const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Employees",
    path: "/employees",
    icon: Users,
  },
  {
    name: "Attendance",
    path: "/attendance",
    icon: CalendarCheck,
  },
  {
    name: "Payroll",
    path: "/payroll",
    icon: Wallet,
  },
  {
  name: "Tasks",
  path: "/tasks",
  icon: ClipboardList,
},
  {
    name: "Inventory",
    path: "/inventory",
    icon: Package,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
  name: "AI Assistant",
  path: "/assistant",
  icon: Bot,
  },
  {
  name: "Profile",
  path: "/profile",
  icon: User,
},
{
  name: "Notifications",
  path: "/notifications",
  icon: Bell,
},
{
  name: "Leave",
  path: "/leave",
  icon: CalendarDays,
},
{
  name: "Departments",
  path: "/departments",
  icon: Building2,
},
];

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white shadow-lg">
      {/* Logo */}
      <div className="p-6 text-center border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400">
          Orvexa AI
        </h1>
        <p className="text-sm text-slate-400">
          Business Operating System
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 w-64 text-center text-xs text-slate-500">
        © 2026 Orvexa AI
      </div>
    </aside>
  );
}

export default Sidebar;