import { Link } from "react-router-dom";

const NotAuthorized = () => {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>⚠️</div>
        <h1 style={styles.title}>Not Authorized</h1>
        <p style={styles.text}>
          You don't have permission to access this page.
        </p>
        <div style={styles.actions}>
          <Link to="/login" style={{ ...styles.button, ...styles.primary }}>
            Go to Login
          </Link>
          <Link to="/" style={{ ...styles.button, ...styles.secondary }}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 20% 20%, rgba(255,215,128,0.05), transparent 25%)," +
      "radial-gradient(circle at 80% 30%, rgba(255,215,128,0.05), transparent 25%)," +
      "radial-gradient(circle at 50% 80%, rgba(255,215,128,0.05), transparent 25%)," +
      "#0f172a",
    color: "#e5e7eb",
    padding: "24px",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    width: "min(480px, 95vw)",
    background:
      "linear-gradient(135deg, rgba(31, 41, 63, 0.95), rgba(20, 26, 40, 0.95))",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "18px",
    padding: "32px 28px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
    textAlign: "center",
    backdropFilter: "blur(8px)",
  },
  icon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "24px",
    fontWeight: 700,
    color: "#f9fafb",
  },
  text: {
    margin: "0 0 20px",
    fontSize: "15px",
    color: "#cbd5e1",
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  button: {
    padding: "12px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 700,
    transition: "transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s ease",
    minWidth: "140px",
    textAlign: "center",
  },
  primary: {
    background: "linear-gradient(90deg, #f5c147, #f1a93c)",
    color: "#1f2937",
    boxShadow: "0 10px 25px rgba(245, 193, 71, 0.25)",
  },
  secondary: {
    background: "rgba(255, 255, 255, 0.06)",
    color: "#e5e7eb",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
};

export default NotAuthorized;

