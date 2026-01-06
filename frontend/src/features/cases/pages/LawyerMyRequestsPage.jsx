import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../../components/ui/PageShell";
import { getMyCaseRequests } from "../services/cases.service";

export default function LawyerMyRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyCaseRequests();
        setRequests(data || []);
      } catch (e) {
        const msg = e?.response?.data?.detail || e?.response?.data?.message || "Failed to load requests.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageShell
      title="My Case Requests"
      subtitle="Track your access requests to client cases"
      maxWidth="max-w-5xl"
      contentClassName="space-y-4"
    >
      {loading && <div className="text-slate-300 text-sm">Loading requests…</div>}

      {error && !loading && (
        <div className="text-sm text-red-200 border border-red-700 bg-red-900/30 rounded-lg p-3">
          {error}
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="text-sm text-slate-300 border border-slate-800 bg-slate-900/60 rounded-lg p-4">
          No requests yet.
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60">
          <table className="min-w-full text-sm text-slate-200">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-4 py-2 text-left">Case</th>
                <th className="px-4 py-2 text-left">District</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Message</th>
                <th className="px-4 py-2 text-left">Requested</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{r.case_title || `Case #${r.case_id}`}</div>
                    <div className="text-xs text-slate-400">ID: {r.case_id}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{r.district || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-200">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {r.message ? <span className="text-slate-200">“{r.message}”</span> : <span className="text-slate-500">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "approved" ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/lawyer/cases/${r.case_id || ""}`)}
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white disabled:opacity-60"
                        disabled={!r.case_id}
                      >
                        {r.case_id ? "Open Case" : "Case ID missing"}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
