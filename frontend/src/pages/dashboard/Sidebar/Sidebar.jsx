import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UsersRound,
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
  Sparkles,
  ShoppingCart,
  Truck,
  ShoppingBag,
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
      name: "Sales",
      path: "/sales",
      icon: ShoppingCart,
      roles: ["admin"],
    },
    {
      name: "Customers",
      path: "/customers",
      icon: UsersRound,
      roles: ["admin"],
    },
    {
      name: "Suppliers",
      path: "/suppliers",
      icon: Truck,
      roles: ["admin"],
    },
    {
      name: "Purchases",
      path: "/purchases",
      icon: ShoppingBag,
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

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <aside className="w-64 min-w-64 shrink-0 h-screen bg-[#0b1220] text-white flex flex-col border-r border-slate-800">
      {/* =====================================================
          BRAND
      ====================================================== */}

      <div className="px-5 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles
              size={23}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Orvexa
              <span className="text-blue-400">
                AI
              </span>
            </h1>

            <p className="text-[11px] text-slate-400 mt-0.5">
              Business Operating System
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div className="flex-1 min-h-0 px-3 py-5">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
          Main Menu
        </p>

        <nav
          className="
            h-full
            overflow-y-auto
            pr-1
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `
                  group
                  relative
                  flex
                  items-center
                  gap-3
                  px-3.5
                  py-3
                  mb-1.5
                  rounded-xl
                  text-sm
                  font-medium
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                  }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-white" />
                    )}

                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.3 : 2}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-blue-400"
                      }
                    />

                    <span className="truncate">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* =====================================================
          USER PROFILE
      ====================================================== */}

      <div className="px-3 pb-3">
        <div className="border-t border-slate-800 pt-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/60 px-3 py-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold uppercase">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "User"}
              </p>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />

                <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                  {user?.role || "User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="px-4 py-3 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-600">
          © 2026 Orvexa AI
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;