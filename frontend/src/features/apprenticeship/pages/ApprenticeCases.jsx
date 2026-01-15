import { Link } from "react-router-dom";

export default function ApprenticeCases() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold">My Assigned Cases</h1>
        <p className="text-slate-300 mt-1">List of cases assigned by lawyers (UI placeholder for now).</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-slate-300 text-sm mb-4">Demo links:</div>
        <Link
          to="/apprentice/cases/1"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-500/90 hover:bg-amber-500 text-slate-950 font-semibold"
        >
          Open Case #1 →
        </Link>
      </div>
    </div>
  );
}
