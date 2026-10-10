import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Wallet,
  Building2,
} from "lucide-react";

import { motion } from "framer-motion";

import api from "../../../services/api";

function DashboardCards() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    monthlySalary: 0,
    departments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/dashboard/stats");

        console.log("Dashboard stats:", response.data);

        const data = response.data || {};

        setStats({
          totalEmployees: data.total_employees ?? 0,
          activeEmployees: data.active_employees ?? 0,
          monthlySalary: data.monthly_salary_expense ?? 0,
          departments: data.departments ?? 0,
        });
      } catch (err) {
        console.error(
          "Failed to load dashboard statistics:",
          err
        );

        setError(
          "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const cards = [
    {
      title: "Total Employees",
      value: loading
        ? "..."
        : stats.totalEmployees,
      icon: Users,
      color: "from-blue-500 to-blue-700",
    },

    {
      title: "Active Employees",
      value: loading
        ? "..."
        : stats.activeEmployees,
      icon: UserCheck,
      color: "from-green-500 to-green-700",
    },

    {
      title: "Monthly Salary",
      value: loading
        ? "..."
        : `₹${Number(
            stats.monthlySalary
          ).toLocaleString("en-IN")}`,
      icon: Wallet,
      color: "from-yellow-500 to-orange-500",
    },

    {
      title: "Departments",
      value: loading
        ? "..."
        : stats.departments,
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
                  <p className="text-sm opacity-80">
                    {card.title}
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {card.value}
                  </h2>

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