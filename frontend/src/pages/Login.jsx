import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUserFromToken } from "../services/auth";

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
      // OAuth2PasswordRequestForm expects form-urlencoded with username and password
      const formData = new URLSearchParams();
      formData.append("username", email); // OAuth2 uses 'username' field for email
      formData.append("password", password);
      
      const { data } = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      localStorage.setItem("token", data.access_token);
      
      // Extract role from response if available, otherwise decode JWT
      let role = data.role || null;
      if (!role) {
        const payload = getUserFromToken();
        role = payload?.role || null;
      }
      
      // Store role in localStorage if we have it
      if (role) {
        localStorage.setItem("role", role);
      }
      
      navigate("/client/dashboard");
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
    <div className="w-full max-w-md mx-auto rounded-2xl border border-amber-500/30 bg-slate-800/90 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8 text-white">
      {/* Logo Section */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="text-3xl">⚖️</div>
        <div className="text-center">
          <div className="text-xl font-bold text-white">
            LexiConnect
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Legal Excellence Platform</div>
        </div>
      </div>

      {/* Welcome Message */}
      <h2 className="text-center text-2xl font-bold text-white mb-1">
        Welcome Back
      </h2>
      <p className="text-center text-sm text-slate-300 mb-6">
        Access your legal services portal
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <label className="block text-sm text-white">
          Email Address
          <div className="mt-2 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-base">✉</span>
            <input
              className="w-full rounded-lg bg-slate-700/80 border border-slate-600/50 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-colors"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>
        </label>

        {/* Password Input */}
        <label className="block text-sm text-white">
          Password
          <div className="mt-2 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-base">🔒</span>
            <input
              className="w-full rounded-lg bg-slate-700/80 border border-slate-600/50 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-colors"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </label>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 py-3 font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-amber-500/25 active:scale-[0.98] disabled:opacity-70 transition-all"
        >
          {loading ? "Signing in..." : "Access Platform"}
        </button>
      </form>

      {/* Registration Link */}
      <div className="mt-5 text-center text-sm text-white">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors">
          Register Now
        </Link>
      </div>

      {/* Demo Accounts Section */}
      <div className="mt-6 rounded-lg bg-slate-700/50 border border-slate-600/30 px-4 py-3 text-sm">
        <div className="font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
          <span>✨</span>
          <span>Demo Accounts:</span>
        </div>
        <ul className="list-none pl-0 text-slate-300 space-y-1">
          <li className="flex items-center gap-2">
            <span className="text-amber-400 text-xs">•</span>
            <span>Client: any email / any password</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-amber-400 text-xs">•</span>
            <span>Lawyer: lawyer@example.com / any password</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-amber-400 text-xs">•</span>
            <span>Admin: admin@lexiconnect.com / any password</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Login;
