import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "client",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      navigate("/login");
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Registration failed. Please check your details.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="logo-block">
          <div className="logo-mark">⚖️</div>
          <div className="logo-text">
            <div className="brand">LexiConnect</div>
            <div className="tagline">Legal Excellence Platform</div>
          </div>
        </div>

        <h2 className="title">Create Account</h2>
        <p className="subtitle">Join the platform to access legal services</p>

        <form onSubmit={handleSubmit} className="form">
          <label className="label">
            Full Name
            <input
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Jane Doe"
              required
            />
          </label>

          <label className="label">
            Email Address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </label>

          <label className="label">
            Phone
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 555 123 4567"
            />
          </label>

          <label className="label">
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </label>

          <label className="label">
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="client">Client</option>
              <option value="lawyer">Lawyer</option>
            </select>
          </label>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="footer-text">
          Already have an account?{" "}
          <Link to="/login" className="link">
            Login
          </Link>
        </div>
      </div>

      <style>{`
        :root { color-scheme: dark; }
        .register-page {
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
        .register-card {
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
        .logo-mark { font-size: 28px; }
        .logo-text .brand { font-size: 20px; font-weight: 700; color: #f7d560; }
        .logo-text .tagline { font-size: 12px; color: #9ca3af; }
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
        .form { display: flex; flex-direction: column; gap: 14px; }
        .label { display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: #cbd5e1; }
        input, select {
          background: #0b1220;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 12px 14px;
          color: #f8fafc;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        input:focus, select:focus {
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
        .link { color: #f5c147; font-weight: 600; text-decoration: none; }
        .link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default Register;

