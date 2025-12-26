import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">⚖️</div>
          <div>
            <h1 className="text-2xl font-bold">LexiConnect</h1>
            <p className="text-sm opacity-70">Legal Excellence Platform</p>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold mb-2">Find legal help. Book faster.</h2>
        <p className="opacity-75 mb-8">
          Login to manage bookings, upload documents, submit disputes, and access your legal services portal.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/login"
            className="w-full sm:w-auto text-center px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 font-semibold"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="w-full sm:w-auto text-center px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold"
          >
            Register
          </Link>
        </div>

        <div className="mt-8 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
          <div className="font-semibold mb-2">🔥 Demo Accounts</div>
          <ul className="text-sm opacity-80 space-y-1">
            <li>• Client: any email / any password</li>
            <li>• Lawyer: lawyer@example.com / any password</li>
            <li>• Admin: admin@lexiconnect.com / any password</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
