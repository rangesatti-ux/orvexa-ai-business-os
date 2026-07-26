function DashboardCards() {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      <div
        style={{
          background: "#2563eb",
          color: "white",
          padding: "20px",
          borderRadius: "10px",
          width: "220px",
        }}
      >
        <h3>Total Sales</h3>
        <h2>₹1,25,000</h2>
      </div>

      <div
        style={{
          background: "#16a34a",
          color: "white",
          padding: "20px",
          borderRadius: "10px",
          width: "220px",
        }}
      >
        <h3>Employees</h3>
        <h2>52</h2>
      </div>

      <div
        style={{
          background: "#ea580c",
          color: "white",
          padding: "20px",
          borderRadius: "10px",
          width: "220px",
        }}
      >
        <h3>Products</h3>
        <h2>420</h2>
      </div>
    </div>
  );
}

export default DashboardCards;