import DashboardCards from "./DashboardCards/DashboardCards";
import Charts from "./Charts/Charts";
import Statistics from "./Statistics/Statistics";
import RecentActivity from "./RecentActivity/RecentActivity";

function Dashboard() {
  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors">
        Dashboard
      </h1>

      <DashboardCards />
      <Charts />
      <Statistics />
      <RecentActivity />

    </div>
  );
}

export default Dashboard;