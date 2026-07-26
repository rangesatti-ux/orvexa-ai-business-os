function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        background: "#111827",
        color: "white",
        padding: "20px",
      }}
    >
      <h2>Orvexa AI</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>🏠 Dashboard</li>
        <li>👥 Employees</li>
        <li>📦 Inventory</li>
        <li>💰 Sales</li>
        <li>📈 Analytics</li>
        <li>⚙ Settings</li>
      </ul>
    </div>
  );
}

export default Sidebar;