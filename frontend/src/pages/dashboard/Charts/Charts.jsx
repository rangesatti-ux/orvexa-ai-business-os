import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import api from "../../../services/api";

function Charts() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/analytics/dashboard");

        console.log("Analytics dashboard:", response.data);

        setAnalytics(response.data || {});
      } catch (err) {
        console.error("Failed to load analytics:", err);

        setError("Unable to load business analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Business Overview
          </h2>

          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            Loading analytics...
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Business Distribution
          </h2>

          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            Loading analytics...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
        <p className="text-red-600 dark:text-red-400">
          {error}
        </p>
      </div>
    );
  }

  const businessData = [
    {
      name: "Employees",
      value: Number(analytics?.employees ?? 0),
    },
    {
      name: "Customers",
      value: Number(analytics?.customers ?? 0),
    },
    {
      name: "Suppliers",
      value: Number(analytics?.suppliers ?? 0),
    },
    {
      name: "Products",
      value: Number(analytics?.products ?? 0),
    },
    {
      name: "Sales",
      value: Number(analytics?.sales ?? 0),
    },
    {
      name: "Purchases",
      value: Number(analytics?.purchases ?? 0),
    },
  ];

  const financialData = [
    {
      name: "Revenue",
      value: Number(analytics?.revenue ?? 0),
    },
    {
      name: "Purchases",
      value: Number(analytics?.purchase_amount ?? 0),
    },
    {
      name: "Payroll",
      value: Number(analytics?.payroll_expense ?? 0),
    },
    {
      name: "Estimated Profit",
      value: Number(analytics?.estimated_profit ?? 0),
    },
  ];

  const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Financial Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 transition-colors">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Financial Overview
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time financial data from Orvexa
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={financialData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#d1d5db"
            />

            <XAxis
              dataKey="name"
              stroke="#6b7280"
            />

            <YAxis
              stroke="#6b7280"
            />

            <Tooltip
              formatter={(value) =>
                `₹${Number(value).toLocaleString("en-IN")}`
              }
            />

            <Bar
              dataKey="value"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Business Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 transition-colors">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Business Overview
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Employees, customers, products and transactions
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={businessData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {businessData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Charts;