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
    <div className="w-full max-w-[520px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-8 text-slate-100">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="text-2xl">⚖️</div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-300 tracking-wide">
            LEXICONNECT
          </div>
          <div className="text-xs text-slate-400">Legal Excellence Platform</div>
        </div>
      </div>

      <h2 className="text-center text-2xl font-bold text-white mt-2">
        Create Account
      </h2>
      <p className="text-center text-sm text-slate-300 mt-1 mb-6">
        Join the platform to access legal services
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-slate-300">
          Full Name
          <div className="mt-2 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">👤</span>
            <input
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className="w-full rounded-xl bg-[#0b1220] border border-white/10 pl-10 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-300/20"
              required
            />
          </div>
        </label>

        <label className="block text-sm text-slate-300">
          Email Address
          <div className="mt-2 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">✉</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full rounded-xl bg-[#0b1220] border border-white/10 pl-10 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-300/20"
              required
            />
          </div>
        </label>

        <label className="block text-sm text-slate-300">
          Phone
          <div className="mt-2 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">📞</span>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 555 123 4567"
              className="w-full rounded-xl bg-[#0b1220] border border-white/10 pl-10 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-300/20"
            />
          </div>
        </label>

        <label className="block text-sm text-slate-300">
          Password
          <div className="mt-2 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">🔒</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-xl bg-[#0b1220] border border-white/10 pl-10 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-300/20"
              required
            />
          </div>
        </label>

        <label className="block text-sm text-slate-300">
          Role
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl bg-[#0b1220] border border-white/10 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-300/20"
          >
            <option value="client">Client</option>
            <option value="lawyer">Lawyer</option>
          </select>
        </label>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 py-3 font-semibold text-white shadow-lg hover:shadow-[0_10px_25px_rgba(245,193,71,0.25)] active:scale-[0.99] disabled:opacity-70 transition-all"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-slate-300">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-amber-300 hover:underline">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Register;

