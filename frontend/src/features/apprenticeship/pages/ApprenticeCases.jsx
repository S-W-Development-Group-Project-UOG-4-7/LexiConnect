import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyApprenticeCases } from "../api/apprenticeshipApi";

export default function ApprenticeCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await fetchMyApprenticeCases();
        setCases(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(
          e?.response?.data?.detail ||
            "Failed to load assigned cases. Are you logged in as apprentice?"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">My Assigned Cases</h1>
        <p className="text-slate-300 mt-2">
          Cases assigned by lawyers. Click to view and add notes.
        </p>
      </div>

      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 text-white">
        {loading && <div className="text-slate-300">Loading...</div>}

        {!loading && err && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}

        {!loading && !err && cases.length === 0 && (
          <div className="text-slate-300">No cases assigned yet.</div>
        )}

        {!loading && !err && cases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((c) => {
              const caseId = c.case_id ?? c.id ?? c.caseId; // tolerate shape
              const title = c.title || c.subject || `Case #${caseId}`;
              const status = c.status || "Assigned";
              return (
                <Link
                  key={caseId}
                  to={`/apprentice/cases/${caseId}`}
                  className="block rounded-xl border border-slate-700/60 bg-slate-950/30 p-5 hover:bg-slate-900/40 transition"
                >
                  <div className="text-lg font-semibold">{title}</div>
                  <div className="text-slate-400 text-sm mt-1">{status}</div>
                  <div className="text-amber-300 text-sm mt-3">
                    Open case →
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
