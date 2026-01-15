import { Outlet, NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition ${
    isActive
      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
      : "text-slate-200 hover:text-white hover:bg-white/5"
  }`;

export default function ApprenticeLayout() {
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl">⚖️</div>
            <div>
              <div className="font-semibold text-amber-300">LexiConnect</div>
              <div className="text-xs text-slate-400 -mt-0.5">Apprentice Portal</div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink to="/apprentice/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/apprentice/cases" className={linkClass}>
              My Assigned Cases
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">User</div>
              <div className="text-sm font-semibold">Apprentice</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              Logout →
            </button>
          </div>
        </div>
      </header>

      {/* Page */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
