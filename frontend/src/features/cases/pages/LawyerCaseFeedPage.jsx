import { useEffect, useState } from "react";
import { getCaseFeed, requestAccess } from "../services/cases.service";

export default function LawyerCaseFeedPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({ district: "", category: "" });
  const [requestingId, setRequestingId] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [successById, setSuccessById] = useState({});

  const loadCases = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCaseFeed({
        district: filters.district || undefined,
        category: filters.category || undefined,
      });
      setCases(data || []);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load cases.";
      setError(message);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    loadCases();
  };

  const startRequest = (caseId) => {
    setRequestingId(caseId);
    setRequestMessage("");
    setSuccessById((prev) => {
      const next = { ...prev };
      delete next[caseId];
      return next;
    });
  };

  const cancelRequest = () => {
    setRequestingId(null);
    setRequestMessage("");
  };

  const submitRequest = async (caseId) => {
    try {
      await requestAccess(caseId, requestMessage);
      setSuccessById((prev) => ({ ...prev, [caseId]: "Request sent" }));
      setRequestingId(null);
      setRequestMessage("");
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to submit request.";
      setSuccessById((prev) => ({ ...prev, [caseId]: message }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="text-sm text-slate-400">Case Feed</div>
            <h1 className="text-3xl font-bold">Open Cases</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto">
            <input
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="District"
              value={filters.district}
              onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
            />
            <input
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Category"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            />
            <button
              onClick={applyFilters}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-sm font-semibold"
            >
              Apply
            </button>
          </div>
        </div>

        {loading && <div className="text-slate-300">Loading cases…</div>}
        {error && !loading && (
          <div className="text-sm text-red-300 border border-red-700 bg-red-900/30 rounded-lg p-3">
            {error}
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <div className="border border-slate-800 bg-slate-900/60 rounded-lg p-4 text-slate-300">
            No open cases found. Adjust filters or check again later.
          </div>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {cases.map((c) => (
              <div
                key={c.id}
                className="border border-slate-800 rounded-xl bg-slate-900/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-white">{c.title}</div>
                  <div className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-200">
                    {c.status}
                  </div>
                </div>
                <div className="text-sm text-amber-200">{c.category}</div>
                <div className="text-sm text-slate-400">{c.district}</div>
                <div className="text-sm text-slate-300 line-clamp-3">{c.summary_public}</div>
                <div className="text-xs text-slate-500">
                  Created: {c.created_at ? new Date(c.created_at).toLocaleString() : "—"}
                </div>

                {successById[c.id] && (
                  <div className="text-sm text-emerald-300 border border-emerald-700/60 bg-emerald-900/30 rounded-lg p-2">
                    {successById[c.id]}
                  </div>
                )}

                {requestingId === c.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Optional message to the client"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitRequest(c.id)}
                        className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-sm font-semibold"
                      >
                        Submit
                      </button>
                      <button
                        onClick={cancelRequest}
                        className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startRequest(c.id)}
                    className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm font-semibold"
                  >
                    Request Access
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
