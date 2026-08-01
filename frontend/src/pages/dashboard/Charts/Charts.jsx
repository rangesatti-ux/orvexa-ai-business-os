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

const salesData = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4200 },
  { month: "May", sales: 6200 },
  { month: "Jun", sales: 7100 },
];

const attendanceData = [
  { name: "Present", value: 85 },
  { name: "Absent", value: 10 },
  { name: "Leave", value: 5 },
];

const COLORS = ["#22c55e", "#ef4444", "#f59e0b"];

function Charts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Monthly Sales */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 transition-colors">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Monthly Sales
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
            />
            <YAxis
              stroke="#6b7280"
            />
            <Tooltip />
            <Bar
              dataKey="sales"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 transition-colors">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Attendance Overview
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>

            <Pie
              data={attendanceData}
              dataKey="value"
              outerRadius={100}
              label
            >
              {attendanceData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Legend />
            <Tooltip />

          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Charts;