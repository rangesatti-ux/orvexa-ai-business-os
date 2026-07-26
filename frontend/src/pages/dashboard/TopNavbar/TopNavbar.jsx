function TopNavbar() {
  return (
    <div
      style={{
        height: "70px",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <h3>Dashboard</h3>

      <div>
        🔔 Notifications
      </div>
    </div>
  );
}

export default TopNavbar;