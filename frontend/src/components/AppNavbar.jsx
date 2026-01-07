import { NavLink, useNavigate } from "react-router-dom";
import { getUserFromToken } from "../services/auth";

const TopNav = ({ links = [], brand = "LexiConnect" }) => {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const role = user?.role || localStorage.getItem("role") || "User";
  const email = localStorage.getItem("email") || "User";

  const handleLogout = () => {
    // 1️⃣ Clear auth data
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    // 2️⃣ Optional: clear axios default header if you set it globally
    if (window.axios) {
      delete window.axios.defaults.headers.common["Authorization"];
    }

    // 3️⃣ Redirect to landing page
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <div className="text-amber-300 font-bold tracking-wide text-sm sm:text-base">
              {brand}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 flex-1 justify-center">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to.endsWith("/dashboard")}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-500/20 text-amber-300 shadow-sm"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* User badge and logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="text-slate-300 font-medium">{email}</span>
              <span className="text-slate-400 capitalize">{role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>Logout</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;

