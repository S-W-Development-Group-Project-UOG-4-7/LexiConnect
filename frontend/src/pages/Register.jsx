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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <Link to="/" className="text-sm text-amber-300 hover:text-amber-200">
          ← Back to Home
        </Link>
        <div className="w-full rounded-2xl border border-amber-500/20 bg-white/5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-8 text-white">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="text-2xl text-white">LC</div>
            <div className="text-center">
              <div className="text-lg font-bold text-white tracking-wide">
                LexiConnect
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
                <input
                  name="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="w-full rounded-xl bg-[#0b1220] border border-white/10 pl-4 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-300/20"
                  required
                />
              </div>
            </label>

            <label className="block text-sm text-slate-300">
              Email Address
              <div className="mt-2 relative">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl bg-[#0b1220] border border-white/10 pl-4 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-300/20"
                  required
                />
              </div>
            </label>

            <label className="block text-sm text-slate-300">
              Phone
              <div className="mt-2 relative">
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 555 123 4567"
                  className="w-full rounded-xl bg-[#0b1220] border border-white/10 pl-4 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-300/20"
                />
              </div>
            </label>

            <label className="block text-sm text-slate-300">
              Password
              <div className="mt-2 relative">
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[#0b1220] border border-white/10 pl-4 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-300/20"
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
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 py-3 font-semibold text-white shadow-lg hover:shadow-[0_10px_25px_rgba(245,193,71,0.25)] active:scale-[0.99] disabled:opacity-70 transition-all"
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
      </div>
    </div>
  );
};

export default Register;

