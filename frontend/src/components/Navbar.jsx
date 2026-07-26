function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 60px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <h2 style={{ color: "#2563EB" }}>
        Orvexa AI
      </h2>

      <div style={{ display: "flex", gap: "25px" }}>
        <a href="#">Home</a>
        <a href="#">Features</a>
        <a href="#">Pricing</a>
        <a href="#">Contact</a>
      </div>

      <button
        style={{
          background: "#2563EB",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Get Started
      </button>
    </nav>
  );
}

export default Navbar;