import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Wallet,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";

import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

function DashboardCards() {
  const { user } = useAuth();
  const userRole = user?.role ? user.role.toLowerCase() : "employee";

  // Per rules: Organization statistics and executive metrics are restricted to Admin and HR roles.
  const canViewStats = ["admin", "hr"].includes(userRole);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    monthlySalary: 0,
    departments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canViewStats) {
      setLoading(false);
      return;
    }

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError("");

        // Corrected endpoint to match backend /dashboard/stats route
        const response = await api.get("/dashboard/stats");
        const data = response.data || {};

        setStats({
          totalEmployees: data.total_employees ?? 0,
          activeEmployees: data.active_employees ?? 0,
          monthlySalary: data.monthly_salary_expense ?? 0,
          departments: data.departments ?? 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
        setError("Unable to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [canViewStats]);

  // If user does not have permission, display an access restriction banner
  if (!canViewStats) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
        <ShieldAlert size={38} className="text-amber-500 mb-3" />
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          Executive Statistics Restricted
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 max-w-md">
          Organization-wide workforce statistics and financial totals are restricted to Administrators and HR personnel.
        </p>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Employees",
      value: loading ? "..." : stats.totalEmployees,
      icon: Users,
      color: "from-blue-500 to-blue-700",
    },
    {
      title: "Active Employees",
      value: loading ? "..." : stats.activeEmployees,
      icon: UserCheck,
      color: "from-green-500 to-green-700",
    },
    {
      title: "Monthly Salary",
      value: loading
        ? "..."
        : `₹${Number(stats.monthlySalary).toLocaleString("en-IN")}`,
      icon: Wallet,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Departments",
      value: loading ? "..." : stats.departments,
      icon: Building2,
      color: "from-purple-500 to-purple-700",
    },
  ];

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`bg-gradient-to-r ${card.color} rounded-2xl p-6 text-white shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">{card.title}</p>
                  <h2 className="text-3xl font-bold mt-2">{card.value}</h2>
                  <p className="text-xs opacity-80 mt-2">
                    Live data from Orvexa backend
                  </p>
                </div>

                <div className="bg-white/20 rounded-full p-4">
                  <Icon size={34} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardCards;