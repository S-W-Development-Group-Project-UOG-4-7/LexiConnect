import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-8"
      style={{
        background: `
          radial-gradient(1200px 700px at 30% 30%, rgba(255,200,90,0.12), transparent 60%),
          radial-gradient(900px 600px at 80% 20%, rgba(120,160,255,0.1), transparent 55%),
          linear-gradient(180deg, #07111f 0%, #040810 100%)
        `,
      }}
    >
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}

