import { Outlet } from "react-router-dom";
import AppNavbar from "./AppNavbar";

const AppShell = ({ navItems = [], brand = "LexiConnect" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 28px, transparent 28px 56px)`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <AppNavbar links={navItems} brand={brand} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;


