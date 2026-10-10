import { useEffect, useState } from "react";
import {
  UserPlus,
  Package,
  IndianRupee,
  Clock,
  Activity,
} from "lucide-react";

import api from "../../../services/api";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/audit/");

        console.log("Recent activity:", response.data);

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.items || [];

        setActivities(data.slice(0, 5));
      } catch (err) {
        console.error(
          "Failed to load recent activity:",
          err
        );

        setError("Unable to load recent activity.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const getActivityIcon = (activity) => {
    const text = `${activity?.action || ""} ${
      activity?.resource || ""
    }`.toLowerCase();

    if (
      text.includes("employee") ||
      text.includes("user")
    ) {
      return UserPlus;
    }

    if (
      text.includes("product") ||
      text.includes("inventory")
    ) {
      return Package;
    }

    if (
      text.includes("payroll") ||
      text.includes("payment") ||
      text.includes("salary")
    ) {
      return IndianRupee;
    }

    if (
      text.includes("attendance") ||
      text.includes("leave")
    ) {
      return Clock;
    }

    return Activity;
  };

  const getActivityColor = (activity) => {
    const text = `${activity?.action || ""} ${
      activity?.resource || ""
    }`.toLowerCase();

    if (
      text.includes("employee") ||
      text.includes("user")
    ) {
      return "text-blue-600";
    }

    if (
      text.includes("product") ||
      text.includes("inventory")
    ) {
      return "text-green-600";
    }

    if (
      text.includes("payroll") ||
      text.includes("payment") ||
      text.includes("salary")
    ) {
      return "text-yellow-600";
    }

    if (
      text.includes("attendance") ||
      text.includes("leave")
    ) {
      return "text-purple-600";
    }

    return "text-gray-600";
  };

  const formatActivityText = (activity) => {
    if (!activity) {
      return "Activity recorded";
    }

    if (activity.action && activity.resource) {
      return `${activity.action} ${activity.resource}`;
    }

    if (activity.action) {
      return activity.action;
    }

    if (activity.description) {
      return activity.description;
    }

    return "Activity recorded";
  };

  const formatTime = (activity) => {
    const dateValue =
      activity?.created_at ||
      activity?.timestamp ||
      activity?.createdAt;

    if (!dateValue) {
      return "Recently";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    const now = new Date();
    const difference = Math.floor(
      (now - date) / 1000
    );

    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {
      const minutes = Math.floor(
        difference / 60
      );

      return `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    if (difference < 86400) {
      const hours = Math.floor(
        difference / 3600
      );

      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    const days = Math.floor(
      difference / 86400
    );

    if (days < 7) {
      return `${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Recent Activity
      </h2>

      {loading && (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          Loading recent activity...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        activities.length === 0 && (
          <div className="py-8 text-center">
            <Activity
              size={40}
              className="mx-auto mb-3 text-gray-400"
            />

            <p className="text-gray-500 dark:text-gray-400">
              No recent activity found.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        activities.length > 0 && (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon =
                getActivityIcon(activity);

              const color =
                getActivityColor(activity);

              return (
                <div
                  key={
                    activity.id ??
                    activity.audit_id ??
                    index
                  }
                  className="flex items-center justify-between border-b dark:border-slate-700 pb-3 last:border-b-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-full">
                      <Icon
                        size={20}
                        className={color}
                      />
                    </div>

                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {formatActivityText(
                          activity
                        )}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(activity)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

export default RecentActivity;