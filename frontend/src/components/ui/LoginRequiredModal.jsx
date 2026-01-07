import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginRequiredModal({
  open = false,
  onClose = () => {},
  title = "Login required",
  description = "Please login or register to continue.",
}) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-slate-300">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              navigate("/login");
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => {
              onClose();
              navigate("/register");
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
