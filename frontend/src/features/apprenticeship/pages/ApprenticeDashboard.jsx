import React from "react";
import { Link } from "react-router-dom";

export default function ApprenticeDashboard() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white border border-slate-700 rounded-lg p-6">
        <h1 className="text-2xl font-bold">Apprentice Dashboard</h1>
        <p className="text-slate-300 mt-1">
          View assigned cases and add internal notes.
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 text-slate-200">
        <div className="font-semibold text-white mb-2">Assigned Cases (placeholder)</div>
        <div className="text-sm text-slate-300">
          UI + API integration will be added next.
        </div>

        {/* TEMP demo link */}
        <div className="mt-4">
          <Link
            to="/apprentice/cases/1"
            className="inline-block bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-400"
          >
            Open Case #1 (demo)
          </Link>
        </div>
      </div>
    </div>
  );
}
