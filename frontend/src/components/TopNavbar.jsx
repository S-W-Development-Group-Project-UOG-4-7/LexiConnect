import { NavLink } from "react-router-dom";

const TopNavbar = ({ brandTitle = "LexiConnect", brandSubtitle, navLinks = [], roleLabel, logoutAction }) => {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
        : "text-slate-200 hover:text-white hover:bg-white/5"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="text-xl">⚖️</div>
          <div>
            <div className="font-semibold text-amber-300">{brandTitle}</div>
            {brandSubtitle && (
              <div className="text-xs text-slate-400 -mt-0.5">{brandSubtitle}</div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">User</div>
            <div className="text-sm font-semibold">{roleLabel}</div>
          </div>
          <button
            onClick={logoutAction}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            Logout →
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
