import {
  Bell,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Wallet,
  Package,
} from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "New Employee Added",
    message: "John David joined the company.",
    time: "10 minutes ago",
    icon: <Users className="text-blue-600" size={24} />,
    color: "bg-blue-100",
  },
  {
    id: 2,
    title: "Payroll Generated",
    message: "Monthly payroll generated successfully.",
    time: "30 minutes ago",
    icon: <Wallet className="text-green-600" size={24} />,
    color: "bg-green-100",
  },
  {
    id: 3,
    title: "Low Inventory Alert",
    message: "Laptop Batteries stock is running low.",
    time: "1 hour ago",
    icon: <Package className="text-red-600" size={24} />,
    color: "bg-red-100",
  },
  {
    id: 4,
    title: "Attendance Completed",
    message: "Today's attendance has been submitted.",
    time: "Today",
    icon: <CheckCircle className="text-green-600" size={24} />,
    color: "bg-green-100",
  },
  {
    id: 5,
    title: "Monthly Report Ready",
    message: "Business report has been generated.",
    time: "Yesterday",
    icon: <FileText className="text-purple-600" size={24} />,
    color: "bg-purple-100",
  },
];

function NotificationsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="text-blue-600" size={32} />
        <h1 className="text-3xl font-bold">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <div className={`${item.color} p-3 rounded-full`}>
                {item.icon}
              </div>

              <div>
                <h2 className="font-semibold text-lg">{item.title}</h2>
                <p className="text-gray-600">{item.message}</p>
              </div>
            </div>

            <span className="text-sm text-gray-500">{item.time}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" />
          <h2 className="text-xl font-semibold">
            Notification Summary
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">5</p>
            <p>Total Notifications</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-600">2</p>
            <p>Successful</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">1</p>
            <p>Warnings</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">2</p>
            <p>Reports</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;