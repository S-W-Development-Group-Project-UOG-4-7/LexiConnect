import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.access_token);
      navigate("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-block">
          <div className="logo-mark">⚖️</div>
          <div className="logo-text">
            <div className="brand">LexiConnect</div>
            <div className="tagline">Legal Excellence Platform</div>
          </div>
        </div>

        <h2 className="title">Welcome Back</h2>
        <p className="subtitle">Access your legal services portal</p>

        <form onSubmit={handleSubmit} className="form">
          <label className="label">
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </label>
          <label className="label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Access Platform"}
          </button>
        </form>

        <div className="footer-text">
          Don’t have an account?{" "}
          <Link to="/register" className="link">
            Register Now
          </Link>
        </div>

        <div className="demo-box">
          <div className="demo-title">✨ Demo Accounts:</div>
          <ul>
            <li>Client: any email / any password</li>
            <li>Lawyer: lawyer@example.com / any password</li>
            <li>Admin: admin@lexiconnect.com / any password</li>
          </ul>
        </div>
      </div>

      <style>{`
        :root {
          color-scheme: dark;
        }
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: radial-gradient(circle at 20% 20%, rgba(255, 215, 128, 0.05), transparent 25%),
            radial-gradient(circle at 80% 30%, rgba(255, 215, 128, 0.05), transparent 25%),
            radial-gradient(circle at 50% 80%, rgba(255, 215, 128, 0.05), transparent 25%),
            #0f172a;
        }
        .login-card {
          width: min(520px, 90vw);
          background: linear-gradient(135deg, rgba(31, 41, 63, 0.95), rgba(20, 26, 40, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
          border-radius: 18px;
          padding: 36px 36px 30px;
          backdrop-filter: blur(8px);
          color: #e5e7eb;
        }
        .logo-block {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          margin-bottom: 12px;
        }
        .logo-mark {
          font-size: 28px;
        }
        .logo-text .brand {
          font-size: 20px;
          font-weight: 700;
          color: #f7d560;
        }
        .logo-text .tagline {
          font-size: 12px;
          color: #9ca3af;
        }
        .title {
          text-align: center;
          margin: 8px 0 4px;
          font-size: 22px;
          font-weight: 700;
          color: #f9fafb;
        }
        .subtitle {
          text-align: center;
          color: #cbd5e1;
          margin-bottom: 22px;
          font-size: 14px;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          color: #cbd5e1;
        }
        input {
          background: #0b1220;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 12px 14px;
          color: #f8fafc;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        input:focus {
          outline: none;
          border-color: #f5c147;
          box-shadow: 0 0 0 3px rgba(245, 193, 71, 0.2);
        }
        button {
          margin-top: 4px;
          padding: 12px 14px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(90deg, #f5c147, #f1a93c);
          color: #1f2937;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }
        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(245, 193, 71, 0.25);
        }
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fecdd3;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
        }
        .footer-text {
          margin-top: 16px;
          text-align: center;
          color: #cbd5e1;
          font-size: 14px;
        }
        .link {
          color: #f5c147;
          font-weight: 600;
          text-decoration: none;
        }
        .link:hover {
          text-decoration: underline;
        }
        .demo-box {
          margin-top: 18px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          color: #e5e7eb;
          font-size: 13px;
        }
        .demo-title {
          margin-bottom: 6px;
          color: #f5c147;
          font-weight: 600;
        }
        .demo-box ul {
          margin: 0;
          padding-left: 18px;
          color: #cbd5e1;
        }
        .demo-box li {
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
};

export default Login;

