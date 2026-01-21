// src/components/TopNavbar.jsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

const TopNavbar = ({
  brandTitle = "LexiConnect",
  brandSubtitle,
  navLinks = [],
  roleLabel = "Lawyer",
  userName = "User",
  avatarUrl = "",
  user,
  logoutAction,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const resolvedUserName = user?.name || userName || "User";
  const resolvedAvatarUrl = user?.avatar || avatarUrl || "";

  const initials = useMemo(() => {
    const parts = (resolvedUserName || "User").trim().split(/\s+/);
    const first = parts[0]?.[0] || "U";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
  }, [resolvedUserName]);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
        : "text-slate-200 hover:text-white hover:bg-white/5"
    }`;

  const handleLogout = () => {
    setProfileOpen(false);
    setMenuOpen(false);
    if (logoutAction) logoutAction();
    else navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-[210px]">
          <div className="text-xl" aria-hidden="true">
            ⚖️
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-amber-300">{brandTitle}</div>
            {brandSubtitle && (
              <div className="text-xs text-slate-400 -mt-0.5">
                {brandSubtitle}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div
          className="flex items-center gap-3 min-w-[210px] justify-end relative"
          ref={profileRef}
        >
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Profile button (keeps old look, but dropdown on click) */}
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            aria-label="Open profile menu"
          >
            <div className="w-9 h-9 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center overflow-hidden">
              {resolvedAvatarUrl ? (
                <img
                  src={resolvedAvatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-amber-200">
                  {initials}
                </span>
              )}
            </div>

            <div className="hidden md:block text-left leading-tight">
              <div className="text-xs text-slate-400">User</div>
              <div className="text-sm font-semibold text-slate-100">
                {roleLabel}
              </div>
            </div>

            <svg
              className="hidden md:block"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-14 w-60 rounded-xl border border-white/10 bg-slate-900 shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="font-semibold text-slate-100">
                  {resolvedUserName}
                </div>
                <div className="text-xs text-slate-400">{roleLabel}</div>
              </div>

              <NavLink
                to="/lawyer/profile/edit"
                className="block px-4 py-3 text-sm text-slate-200 hover:bg-white/5"
                onClick={() => setProfileOpen(false)}
              >
                Edit Profile
              </NavLink>

              <NavLink
                to="/lawyer/public-profile"
                className="block px-4 py-3 text-sm text-slate-200 hover:bg-white/5"
                onClick={() => setProfileOpen(false)}
              >
                View Public Profile
              </NavLink>

              <div className="border-t border-white/10" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/10"
              >
                Logout →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/90 backdrop-blur">
          <nav className="px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default TopNavbar;
