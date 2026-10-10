import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Users,
} from "lucide-react";

import api from "../../../services/api";

function Statistics() {
  const [analytics, setAnalytics] = useState({
    sales: 0,
    revenue: 0,
    customers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/analytics/dashboard");

        console.log("Statistics data:", response.data);

        const data = response.data || {};

        setAnalytics({
          sales: data.sales ?? 0,
          revenue: data.revenue ?? 0,
          customers: data.customers ?? 0,
        });
      } catch (err) {
        console.error(
          "Failed to load statistics:",
          err
        );

        setError("Unable to load statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const stats = [
    {
      title: "Total Sales",
      value: loading
        ? "..."
        : analytics.sales.toLocaleString("en-IN"),
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Revenue",
      value: loading
        ? "..."
        : `₹${Number(
            analytics.revenue
          ).toLocaleString("en-IN")}`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Customers",
      value: loading
        ? "..."
        : analytics.customers.toLocaleString("en-IN"),
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Statistics
        </h2>

        <span className="text-xs text-gray-500 dark:text-gray-400">
          Live backend data
        </span>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="border dark:border-slate-700 rounded-xl p-5 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {item.title}
                  </p>

                  <h3 className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">
                    {item.value}
                  </h3>
                </div>

                <Icon
                  size={34}
                  className={item.color}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Statistics;