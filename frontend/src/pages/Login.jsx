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
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      // OAuth2PasswordRequestForm expects form-urlencoded with username and password
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const { data } = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, refresh_token, token_type } = data || {};

      if (!access_token) {
        throw new Error("Login failed. Please check your credentials.");
      }

      localStorage.setItem("access_token", access_token);
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }
      localStorage.setItem("token_type", token_type || "bearer");

      // Decode role from JWT payload
      let role = "";
      try {
        let base64 = (access_token.split(".")[1] || "")
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        const payloadStr = atob(base64);
        const payload = JSON.parse(payloadStr);
        role = String(payload?.role || "").toLowerCase();
      } catch {
        const payload = getUserFromToken();
        role = String(payload?.role || "").toLowerCase();
      }

      if (role) localStorage.setItem("role", role);

      // ✅ Redirect based on role
      let target = "/dashboard"; // uses DashboardRedirect as a safe default
      if (role === "lawyer") target = "/lawyer";
      else if (role === "client") target = "/client";
      else if (role === "admin") target = "/admin";
      else if (role === "apprentice") target = "/apprentice";

      if (import.meta.env.DEV) {
        console.log("[login] token saved to access_token");
        console.log("[login] detected role:", role || "unknown");
        console.log("[login] redirecting to:", target);
      }

      navigate(target, { replace: true });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <Link
            to="/"
            className="text-sm text-amber-300 hover:text-amber-200 flex items-center gap-1"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="w-full rounded-2xl border border-amber-500/20 bg-white/5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-8 text-white">
          {/* Logo Section */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-3xl">⚖️</div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">LexiConnect</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Legal Excellence Platform
              </div>
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-base">
                  ✉
                </span>
                <input
                  className="w-full rounded-lg bg-slate-900/70 border border-slate-700/70 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-base">
                  🔒
                </span>
                <input
                  className="w-full rounded-lg bg-slate-900/70 border border-slate-700/70 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
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
            <Link
              to="/register"
              className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
