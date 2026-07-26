import Sidebar from "./Sidebar/Sidebar";
import TopNavbar from "./TopNavbar/TopNavbar";
import DashboardCards from "./DashboardCards/DashboardCards";
import Charts from "./Charts/Charts";
import Statistics from "./Statistics/Statistics";
import RecentActivity from "./RecentActivity/RecentActivity";

function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          background: "#f3f4f6",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <TopNavbar />
        <DashboardCards />
        <Charts />
        <Statistics />
        <RecentActivity />
      </div>
    </div>
  );
}

export default Dashboard;