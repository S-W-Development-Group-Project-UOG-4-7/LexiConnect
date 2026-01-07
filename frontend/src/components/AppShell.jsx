import { Outlet } from "react-router-dom";
import AppNavbar from "./AppNavbar";

const AppShell = ({ navItems = [], brand = "LexiConnect" }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        <AppNavbar links={navItems} brand={brand} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;


