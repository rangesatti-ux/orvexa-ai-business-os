import { Link } from "react-router-dom";

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

        <li style={{ marginBottom: "20px" }}>
          <Link
            to="/"
            style={{ color: "white", textDecoration: "none" }}
          >
            🏠 Dashboard
          </Link>
        </li>

        <li style={{ marginBottom: "20px" }}>
          <Link
            to="/employees"
            style={{ color: "white", textDecoration: "none" }}
          >
            👨‍💼 Employees
          </Link>
        </li>

        <li style={{ marginBottom: "20px" }}>
          <Link
            to="/attendance"
            style={{ color: "white", textDecoration: "none" }}
          >
            📅 Attendance
          </Link>
        </li>

        <li style={{ marginBottom: "20px" }}>
          <Link
            to="/inventory"
            style={{ color: "white", textDecoration: "none" }}
          >
            📦 Inventory
          </Link>
        </li>

        <li style={{ marginBottom: "20px" }}>
          <Link
            to="/payroll"
            style={{ color: "white", textDecoration: "none" }}
          >
            💰 Payroll
          </Link>
        </li>

        <li style={{ marginBottom: "20px" }}>
          <Link
            to="/settings"
            style={{ color: "white", textDecoration: "none" }}
          >
            ⚙️ Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;