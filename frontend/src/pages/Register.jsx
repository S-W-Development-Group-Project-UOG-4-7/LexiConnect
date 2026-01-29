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
    district: "",
    city: "",
    specialization: "",
    languages: "",
    years_of_experience: "",
    bio: "",
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
      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      };

      if (form.role === "lawyer") {
        if (form.district) payload.district = form.district;
        if (form.city) payload.city = form.city;
        if (form.specialization) payload.specialization = form.specialization;
        if (form.languages) payload.languages = form.languages;
        if (form.years_of_experience) {
          payload.years_of_experience = Number(form.years_of_experience);
        }
        if (form.bio) payload.bio = form.bio;
      }

      await api.post("/auth/register", payload);
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
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <Link
          to="/"
          className="text-sm text-amber-300 hover:text-amber-200 flex items-center gap-1"
        >
          <span>&larr;</span>
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full rounded-2xl border border-amber-500/20 bg-white/5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-8 text-white">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-3xl">LC</div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">LexiConnect</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Legal Excellence Platform
            </div>
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold text-white mb-1">
          Create Account
        </h2>
        <p className="text-center text-sm text-slate-300 mb-6">
          Join the platform to access legal services
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-white">
            Full Name
            <div className="mt-2 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-base">
                A
              </span>
              <input
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full rounded-lg bg-slate-900/70 border border-slate-700/70 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
                required
              />
            </div>
          </label>

          <label className="block text-sm text-white">
            Email Address
            <div className="mt-2 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-base">
                @
              </span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full rounded-lg bg-slate-900/70 border border-slate-700/70 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
                required
              />
            </div>
          </label>

          <label className="block text-sm text-white">
            Phone
            <div className="mt-2 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-base">
                +
              </span>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 555 123 4567"
                className="w-full rounded-lg bg-slate-900/70 border border-slate-700/70 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
              />
            </div>
          </label>

          <label className="block text-sm text-white">
            Password
            <div className="mt-2 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-base">
                *
              </span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="password"
                className="w-full rounded-lg bg-slate-900/70 border border-slate-700/70 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
                required
              />
            </div>
          </label>

          <label className="block text-sm text-white">
            Role
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
            >
              <option value="client">Client</option>
              <option value="lawyer">Lawyer</option>
              <option value="apprentice">Apprentice</option>
            </select>
          </label>

          {form.role === "lawyer" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block text-sm text-white">
                  District (optional)
                  <input
                    name="district"
                    type="text"
                    value={form.district}
                    onChange={handleChange}
                    placeholder="Colombo"
                    className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
                  />
                </label>

                <label className="block text-sm text-white">
                  City (optional)
                  <input
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Colombo"
                    className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block text-sm text-white">
                  Specialization (optional)
                  <input
                    name="specialization"
                    type="text"
                    value={form.specialization}
                    onChange={handleChange}
                    placeholder="Corporate Law"
                    className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
                  />
                </label>

                <label className="block text-sm text-white">
                  Languages (optional)
                  <input
                    name="languages"
                    type="text"
                    value={form.languages}
                    onChange={handleChange}
                    placeholder="Sinhala, English"
                    className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block text-sm text-white">
                  Years of Experience (optional)
                  <input
                    name="years_of_experience"
                    type="number"
                    min="0"
                    value={form.years_of_experience}
                    onChange={handleChange}
                    placeholder="0"
                    className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
                  />
                </label>
              </div>

              <label className="block text-sm text-white">
                Bio (optional)
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Brief profile summary"
                  className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 transition-colors"
                  rows={3}
                />
              </label>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 py-3 font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-amber-500/25 active:scale-[0.98] disabled:opacity-70 transition-all"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-white">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
