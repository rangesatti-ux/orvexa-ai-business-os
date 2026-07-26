function Hero() {
  return (
    <section
      style={{
        background: "#0F172A",
        color: "white",
        textAlign: "center",
        padding: "100px 20px",
      }}
    >
      <h1 style={{ fontSize: "52px", marginBottom: "20px" }}>
        Orvexa AI Business OS
      </h1>

      <p
        style={{
          fontSize: "20px",
          color: "#CBD5E1",
          marginBottom: "30px",
        }}
      >
        Manage Employees, Sales, Inventory and Finance using AI.
      </p>

      <button
        style={{
          background: "#2563EB",
          color: "white",
          padding: "14px 32px",
          border: "none",
          borderRadius: "10px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        Get Started
      </button>
    </section>
  );
}

export default Hero;