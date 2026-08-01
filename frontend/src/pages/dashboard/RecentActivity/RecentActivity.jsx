import {
  UserPlus,
  Package,
  IndianRupee,
  Clock,
} from "lucide-react";

const activities = [
  {
    icon: UserPlus,
    text: "New Employee Added",
    time: "10 mins ago",
    color: "text-blue-600",
  },
  {
    icon: Package,
    text: "Inventory Updated",
    time: "30 mins ago",
    color: "text-green-600",
  },
  {
    icon: IndianRupee,
    text: "Payroll Generated",
    time: "1 hour ago",
    color: "text-yellow-600",
  },
  {
    icon: Clock,
    text: "Attendance Marked",
    time: "2 hours ago",
    color: "text-purple-600",
  },
];

function RecentActivity() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors">

      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Recent Activity
      </h2>

      <div className="space-y-4">

        {activities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div
              key={index}
              className="flex items-center justify-between border-b dark:border-slate-700 pb-3"
            >
              <div className="flex items-center gap-4">

                <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-full">
                  <Icon
                    size={20}
                    className={activity.color}
                  />
                </div>

                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {activity.text}
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default RecentActivity;