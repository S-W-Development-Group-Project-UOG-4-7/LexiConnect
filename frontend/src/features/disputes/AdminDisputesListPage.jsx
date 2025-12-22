import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminListDisputes } from "../../services/disputes";

export default function AdminDisputesListPage() {
  const [status, setStatus] = useState("PENDING");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await adminListDisputes(status);
      setItems(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Disputes</h1>
      <p className="text-sm opacity-70 mb-6">Review and resolve client disputes.</p>

      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-2 rounded ${status === "PENDING" ? "bg-white/10" : "bg-transparent border border-white/10"}`}
          onClick={() => setStatus("PENDING")}
        >
          Pending
        </button>
        <button
          className={`px-3 py-2 rounded ${status === "RESOLVED" ? "bg-white/10" : "bg-transparent border border-white/10"}`}
          onClick={() => setStatus("RESOLVED")}
        >
          Resolved
        </button>
        <button className="px-3 py-2 rounded border border-white/10" onClick={load}>
          Refresh
        </button>
      </div>

      {loading && <div className="opacity-70">Loading…</div>}
      {err && <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-200">{err}</div>}

      {!loading && !err && items.length === 0 && (
        <div className="p-6 rounded bg-white/5 border border-white/10 opacity-80">
          No disputes found for {status}.
        </div>
      )}

      <div className="grid gap-3 mt-4">
        {items.map((d) => (
          <button
            key={d.id}
            onClick={() => navigate(`/admin/disputes/${d.id}`)}
            className="text-left p-4 rounded bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <div className="flex justify-between items-center">
              <div className="font-semibold">#{d.id} — {d.title}</div>
              <div className="text-xs px-2 py-1 rounded bg-white/10">{d.status}</div>
            </div>
            <div className="text-sm opacity-70 mt-1 line-clamp-2">{d.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
