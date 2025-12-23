import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Subtle radial gold glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[60%] right-[20%] w-[500px] h-[500px] bg-amber-300/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[50%] w-[400px] h-[400px] bg-amber-500/6 rounded-full blur-3xl"></div>
      </div>
      {/* Diamond pattern overlay */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 28px, transparent 28px 56px)`
        }}
      />
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}

