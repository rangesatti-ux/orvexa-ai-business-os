import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Wallet,
  Package,
  RefreshCw,
  Clock,
  Info,
} from "lucide-react";

import api from "../../services/api";

function getNotificationIcon(item) {
  const text = `${item.title || ""} ${item.message || ""} ${
    item.type || item.category || ""
  }`.toLowerCase();

  if (text.includes("employee") || text.includes("user")) {
    return Users;
  }

  if (text.includes("payroll") || text.includes("salary")) {
    return Wallet;
  }

  if (
    text.includes("inventory") ||
    text.includes("stock") ||
    text.includes("product")
  ) {
    return Package;
  }

  if (text.includes("report")) {
    return FileText;
  }

  if (
    text.includes("warning") ||
    text.includes("low stock") ||
    text.includes("alert") ||
    text.includes("error")
  ) {
    return AlertTriangle;
  }

  if (text.includes("success") || text.includes("completed")) {
    return CheckCircle;
  }

  return Bell;
}

function getNotificationStyle(item) {
  const text = `${item.title || ""} ${item.message || ""} ${
    item.type || item.category || ""
  }`.toLowerCase();

  if (
    text.includes("warning") ||
    text.includes("low stock") ||
    text.includes("alert") ||
    text.includes("error")
  ) {
    return {
      color: "text-red-600 dark:text-red-400",
      background: "bg-red-100 dark:bg-red-900/30",
    };
  }

  if (
    text.includes("success") ||
    text.includes("completed") ||
    text.includes("payroll")
  ) {
    return {
      color: "text-green-600 dark:text-green-400",
      background: "bg-green-100 dark:bg-green-900/30",
    };
  }

  if (text.includes("report")) {
    return {
      color: "text-purple-600 dark:text-purple-400",
      background: "bg-purple-100 dark:bg-purple-900/30",
    };
  }

  return {
    color: "text-blue-600 dark:text-blue-400",
    background: "bg-blue-100 dark:bg-blue-900/30",
  };
}

function formatTime(value) {
  if (!value) return "Time unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications/");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
        ? data.notifications
        : Array.isArray(data?.items)
        ? data.items
        : null;

      if (!list) {
        throw new Error(
          "The notifications API returned an unexpected response format."
        );
      }

      setNotifications(list);
    } catch (err) {
      console.error("Failed to load notifications:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const successfulCount = notifications.filter((item) => {
    const text = `${item.title || ""} ${item.message || ""} ${
      item.type || item.category || ""
    }`.toLowerCase();

    return (
      text.includes("success") ||
      text.includes("completed") ||
      text.includes("approved")
    );
  }).length;

  const warningCount = notifications.filter((item) => {
    const text = `${item.title || ""} ${item.message || ""} ${
      item.type || item.category || ""
    }`.toLowerCase();

    return (
      text.includes("warning") ||
      text.includes("alert") ||
      text.includes("low stock") ||
      text.includes("error")
    );
  }).length;

  const reportCount = notifications.filter((item) => {
    const text = `${item.title || ""} ${item.message || ""} ${
      item.type || item.category || ""
    }`.toLowerCase();

    return text.includes("report");
  }).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
            <Bell
              className="text-blue-600 dark:text-blue-400"
              size={28}
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Updates from your business system.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadNotifications}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          <RefreshCw size={17} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <p>{error}</p>
          <button
            type="button"
            onClick={loadNotifications}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Notifications",
            value: notifications.length,
            color: "text-blue-600 dark:text-blue-400",
            icon: Bell,
          },
          {
            label: "Successful",
            value: successfulCount,
            color: "text-green-600 dark:text-green-400",
            icon: CheckCircle,
          },
          {
            label: "Warnings",
            value: warningCount,
            color: "text-yellow-600 dark:text-yellow-400",
            icon: AlertTriangle,
          },
          {
            label: "Reports",
            value: reportCount,
            color: "text-purple-600 dark:text-purple-400",
            icon: FileText,
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {card.label}
                </p>
                <Icon className={card.color} size={22} />
              </div>

              <p className={`mt-3 text-3xl font-bold ${card.color}`}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-gray-200 p-5 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Recent Notifications
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 && !error ? (
          <div className="p-12 text-center">
            <Info
              className="mx-auto mb-3 text-gray-400"
              size={36}
            />
            <p className="font-medium text-gray-700 dark:text-white">
              No notifications found
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              New notifications will appear here when available.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {notifications.map((item, index) => {
              const Icon = getNotificationIcon(item);
              const style = getNotificationStyle(item);

              return (
                <div
                  key={item.id ?? item.notification_id ?? index}
                  className="flex flex-col gap-4 p-5 transition hover:bg-gray-50 dark:hover:bg-slate-700/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className={`shrink-0 rounded-full p-3 ${style.background}`}>
                      <Icon className={style.color} size={22} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.title ||
                          item.subject ||
                          item.type ||
                          "Notification"}
                      </h3>

                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600 dark:text-slate-300">
                        {item.message ||
                          item.description ||
                          item.content ||
                          "No additional details."}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-sm text-gray-500 dark:text-slate-400 sm:pl-4">
                    <Clock size={15} />
                    {formatTime(
                      item.created_at ||
                        item.timestamp ||
                        item.time ||
                        item.date
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;