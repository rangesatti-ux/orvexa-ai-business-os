import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const employeeData = [
  { month: "Jan", employees: 35 },
  { month: "Feb", employees: 42 },
  { month: "Mar", employees: 50 },
  { month: "Apr", employees: 58 },
  { month: "May", employees: 65 },
  { month: "Jun", employees: 72 },
];

const attendanceData = [
  { month: "Jan", attendance: 88 },
  { month: "Feb", attendance: 90 },
  { month: "Mar", attendance: 92 },
  { month: "Apr", attendance: 95 },
  { month: "May", attendance: 93 },
  { month: "Jun", attendance: 96 },
];

const statusData = [
  { name: "Present", value: 82 },
  { name: "Leave", value: 10 },
  { name: "Absent", value: 8 },
];

const COLORS = ["#22c55e", "#facc15", "#ef4444"];

function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">

      <h1 className="text-3xl font-bold">
        Analytics Dashboard
      </h1>

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="bg-blue-600 text-white rounded-xl p-5 shadow">
          <h3>Total Employees</h3>
          <p className="text-3xl font-bold">72</p>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-5 shadow">
          <h3>Attendance</h3>
          <p className="text-3xl font-bold">96%</p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5 shadow">
          <h3>Payroll</h3>
          <p className="text-3xl font-bold">₹15.2L</p>
        </div>

        <div className="bg-red-600 text-white rounded-xl p-5 shadow">
          <h3>Inventory Value</h3>
          <p className="text-3xl font-bold">₹8.4L</p>
        </div>

      </div>

      {/* Charts */}

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">
            Employee Growth
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="employees"
                fill="#2563eb"
              />
            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">
            Attendance Status
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>

              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip />

            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow p-5">

        <h2 className="text-xl font-semibold mb-4">
          Attendance Trend
        </h2>

        <ResponsiveContainer width="100%" height={320}>

          <LineChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#16a34a"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default AnalyticsPage;