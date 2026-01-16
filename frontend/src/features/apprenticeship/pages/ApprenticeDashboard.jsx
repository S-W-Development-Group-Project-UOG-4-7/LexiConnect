import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyApprenticeCases } from "../api/apprenticeshipApi";

export default function ApprenticeDashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyApprenticeCases();
        setCases(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const preview = cases.slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">Apprentice Dashboard</h1>
        <p className="text-slate-300 mt-2">
          View assigned cases and add internal notes.
        </p>
      </div>

      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Assigned Cases</h2>
          <Link to="/apprentice/cases" className="text-amber-300 text-sm">
            View all →
          </Link>
        </div>

        <div className="mt-4">
          {loading && <div className="text-slate-300">Loading...</div>}

          {!loading && preview.length === 0 && (
            <div className="text-slate-300">No cases assigned yet.</div>
          )}

          {!loading && preview.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preview.map((c) => {
                const caseId = c.case_id ?? c.id ?? c.caseId;
                const title = c.title || c.subject || `Case #${caseId}`;
                return (
                  <Link
                    key={caseId}
                    to={`/apprentice/cases/${caseId}`}
                    className="block rounded-xl border border-slate-700/60 bg-slate-950/30 p-5 hover:bg-slate-900/40 transition"
                  >
                    <div className="text-lg font-semibold">{title}</div>
                    <div className="text-slate-400 text-sm mt-1">
                      Open to view details and add notes.
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
