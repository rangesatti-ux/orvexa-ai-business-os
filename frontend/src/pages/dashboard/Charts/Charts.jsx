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

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-xl font-bold mb-4">
          Monthly Sales
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#3b82f6" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-xl font-bold mb-4">
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