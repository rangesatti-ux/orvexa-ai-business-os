import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserRound,
  Truck,
  Package,
  ShoppingCart,
  ShoppingBag,
  IndianRupee,
  Wallet,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Activity,
} from "lucide-react";

import api from "../../services/api";

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/analytics/dashboard");

      setAnalytics(response.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const metrics = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        title: "Employees",
        value: analytics.employees,
        icon: Users,
        description: "Total employees",
        iconClass:
          "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      },
      {
        title: "Customers",
        value: analytics.customers,
        icon: UserRound,
        description: "Total customers",
        iconClass:
          "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
      },
      {
        title: "Suppliers",
        value: analytics.suppliers,
        icon: Truck,
        description: "Total suppliers",
        iconClass:
          "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
      },
      {
        title: "Products",
        value: analytics.products,
        icon: Package,
        description: "Inventory products",
        iconClass:
          "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400",
      },
      {
        title: "Sales",
        value: analytics.sales,
        icon: ShoppingCart,
        description: "Total sales",
        iconClass:
          "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
      },
      {
        title: "Purchases",
        value: analytics.purchases,
        icon: ShoppingBag,
        description: "Total purchases",
        iconClass:
          "bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
      },
    ];
  }, [analytics]);

  const financialMetrics = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        title: "Revenue",
        value: analytics.revenue,
        icon: IndianRupee,
        iconClass:
          "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400",
      },
      {
        title: "Purchase Amount",
        value: analytics.purchase_amount,
        icon: ShoppingBag,
        iconClass:
          "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
      },
      {
        title: "Payroll Expense",
        value: analytics.payroll_expense,
        icon: Wallet,
        iconClass:
          "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
      },
      {
        title: "Estimated Profit",
        value: analytics.estimated_profit,
        icon: TrendingUp,
        iconClass:
          "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      },
    ];
  }, [analytics]);

  const businessBars = useMemo(() => {
    if (!analytics) return [];

    const values = [
      {
        label: "Employees",
        value: Number(analytics.employees || 0),
      },
      {
        label: "Customers",
        value: Number(analytics.customers || 0),
      },
      {
        label: "Suppliers",
        value: Number(analytics.suppliers || 0),
      },
      {
        label: "Products",
        value: Number(analytics.products || 0),
      },
      {
        label: "Sales",
        value: Number(analytics.sales || 0),
      },
      {
        label: "Purchases",
        value: Number(analytics.purchases || 0),
      },
    ];

    const maxValue = Math.max(
      ...values.map((item) => item.value),
      1
    );

    return values.map((item) => ({
      ...item,
      percentage:
        item.value === 0
          ? 0
          : Math.max(
              (item.value / maxValue) * 100,
              4
            ),
    }));
  }, [analytics]);

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Business performance overview from live data.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && !analytics ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw
              size={28}
              className="animate-spin text-blue-500"
            />

            <p className="text-sm text-gray-500 dark:text-slate-400">
              Loading analytics...
            </p>
          </div>
        </div>
      ) : analytics ? (
        <>
          {/* =====================================================
              BUSINESS METRICS
          ====================================================== */}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Activity
                size={19}
                className="text-blue-500"
              />

              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Business Overview
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={metric.title}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {metric.title}
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
                          {metric.value}
                        </p>

                        <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                          {metric.description}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl p-3 ${metric.iconClass}`}
                      >
                        <Icon size={22} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =====================================================
              FINANCIAL METRICS
          ====================================================== */}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <IndianRupee
                size={19}
                className="text-green-500"
              />

              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Financial Overview
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {financialMetrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={metric.title}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {metric.title}
                        </p>

                        <p className="mt-2 text-xl font-bold text-gray-800 dark:text-white">
                          {formatCurrency(
                            metric.value
                          )}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl p-3 ${metric.iconClass}`}
                      >
                        <Icon size={21} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =====================================================
              CHART / BUSINESS ACTIVITY
          ====================================================== */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Business Activity
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Current counts across major business areas.
                </p>
              </div>

              <div className="space-y-5">
                {businessBars.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                        {item.label}
                      </span>

                      <span className="text-sm font-semibold text-gray-800 dark:text-white">
                        {item.value}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* =================================================
                PROFIT SUMMARY
            ================================================== */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Financial Summary
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Revenue, costs and estimated profit.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-4 dark:bg-green-500/10">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Revenue
                    </p>

                    <p className="mt-1 text-xl font-bold text-green-800 dark:text-green-300">
                      {formatCurrency(
                        analytics.revenue
                      )}
                    </p>
                  </div>

                  <IndianRupee
                    size={24}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-4 dark:bg-orange-500/10">
                  <div>
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      Purchase Amount
                    </p>

                    <p className="mt-1 text-xl font-bold text-orange-800 dark:text-orange-300">
                      {formatCurrency(
                        analytics.purchase_amount
                      )}
                    </p>
                  </div>

                  <ShoppingBag
                    size={24}
                    className="text-orange-600 dark:text-orange-400"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-purple-50 px-4 py-4 dark:bg-purple-500/10">
                  <div>
                    <p className="text-sm text-purple-700 dark:text-purple-400">
                      Payroll Expense
                    </p>

                    <p className="mt-1 text-xl font-bold text-purple-800 dark:text-purple-300">
                      {formatCurrency(
                        analytics.payroll_expense
                      )}
                    </p>
                  </div>

                  <Wallet
                    size={24}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>

                <div className="border-t border-gray-200 pt-5 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                        Estimated Profit
                      </p>

                      <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(
                          analytics.estimated_profit
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <TrendingUp size={25} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              LOW STOCK ALERT
          ====================================================== */}

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <AlertTriangle size={23} />
              </div>

              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  Low Stock Products
                </p>

                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  {analytics.low_stock_products}{" "}
                  product
                  {Number(
                    analytics.low_stock_products
                  ) === 1
                    ? ""
                    : "s"}{" "}
                  currently require attention.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default AnalyticsPage;