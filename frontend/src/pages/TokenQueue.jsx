import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const statusStyles = {
  PENDING: "bg-slate-500/15 text-slate-200 border-slate-400/20",
  CONFIRMED: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
  IN_PROGRESS: "bg-amber-500/15 text-amber-200 border-amber-400/20",
  COMPLETED: "bg-sky-500/15 text-sky-200 border-sky-400/20",
  CANCELLED: "bg-rose-500/15 text-rose-200 border-rose-400/20",
};

const normalizeStatus = (s) => {
  if (!s) return "PENDING";
  const v = String(s).toUpperCase();
  if (v === "IN-PROGRESS" || v === "INPROGRESS") return "IN_PROGRESS";
  if (v === "DONE") return "COMPLETED";
  return v;
};

const formatDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return String(d);
  }
};

const formatTime = (t) => {
  if (!t) return "-";
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
};

const buildDemoItems = () => [
  {
    id: 101,
    client_name: "Client A",
    date: new Date().toISOString().slice(0, 10),
    time: "09:30:00",
    reason: "Affidavit drafting",
    status: "CONFIRMED",
  },
  {
    id: 102,
    client_name: "Client B",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00:00",
    reason: "Bail application",
    status: "PENDING",
  },
  {
    id: 103,
    client_name: "Client C",
    date: new Date().toISOString().slice(0, 10),
    time: "10:30:00",
    reason: "Contract review",
    status: "PENDING",
  },
];

const TokenQueue = () => {
  const endpoint = import.meta.env.VITE_TOKEN_QUEUE_ENDPOINT;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    date: "",
    status: "ALL",
  });

  const [actionId, setActionId] = useState(null);

  const fetchQueue = async () => {
    setError("");

    if (!endpoint) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(endpoint);
      const normalized = (Array.isArray(data) ? data : []).map((x) => ({
        ...x,
        status: normalizeStatus(x.status),
      }));
      setItems(normalized);
      setIsDemo(false);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load token queue.";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const targetDate = filters.date;
    const status = filters.status;

    return (items || [])
      .map((x) => ({ ...x, status: normalizeStatus(x.status) }))
      .filter((x) => {
        if (targetDate && String(x.date) !== targetDate) return false;
        if (status !== "ALL" && normalizeStatus(x.status) !== status) return false;
        if (!q) return true;

        const haystack = [
          x.client_name,
          x.client_email,
          x.reason,
          x.branch_name,
          x.status,
          x.id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        const aKey = `${a.date || ""} ${formatTime(a.time)}`;
        const bKey = `${b.date || ""} ${formatTime(b.time)}`;
        return aKey.localeCompare(bKey);
      });
  }, [filters, items]);

  const counts = useMemo(() => {
    const all = filtered;
    const byStatus = all.reduce(
      (acc, x) => {
        const s = normalizeStatus(x.status);
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      { PENDING: 0, CONFIRMED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 }
    );

    const inProgress = all.find((x) => normalizeStatus(x.status) === "IN_PROGRESS");

    return {
      total: all.length,
      byStatus,
      inProgress,
    };
  }, [filtered]);

  const setFilter = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  const handleLoadDemo = () => {
    setError("");
    setItems(buildDemoItems());
    setIsDemo(true);
  };

  const handleLocalStatus = (id, status) => {
    setItems((prev) =>
      (prev || []).map((x) => (x.id === id ? { ...x, status } : x))
    );
  };

  const handleAction = async (id, nextStatus) => {
    if (isDemo || !endpoint) {
      handleLocalStatus(id, nextStatus);
      return;
    }

    setError("");
    setActionId(id);
    try {
      await api.patch(`${endpoint}/${id}`, { status: nextStatus });
      handleLocalStatus(id, nextStatus);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Action failed.";
      setError(message);
    } finally {
      setActionId(null);
    }
  };

  const StatusPill = ({ value }) => {
    const s = normalizeStatus(value);
    const cls = statusStyles[s] || statusStyles.PENDING;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
      >
        {s}
      </span>
    );
  };

  const Card = ({ title, value, sub }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.35)]">
      <div className="text-xs text-slate-400">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-50">{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-400">{sub}</div> : null}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Token Queue</h1>
          <p className="mt-1 text-sm text-slate-300">
            Manage your upcoming clients and consultation flow.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchQueue}
            disabled={loading || !endpoint}
            className={`px-4 py-2 rounded-lg text-sm font-medium border border-white/10 transition-colors ${
              loading || !endpoint
                ? "bg-white/5 text-slate-400"
                : "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
            }`}
            title={endpoint ? "Refresh" : "Set VITE_TOKEN_QUEUE_ENDPOINT to enable live data"}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={handleLoadDemo}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-amber-400/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15 transition-colors"
          >
            Load Demo Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card title="Total in view" value={counts.total} />
        <Card title="Confirmed" value={counts.byStatus.CONFIRMED} />
        <Card title="Waiting" value={counts.byStatus.PENDING} />
        <Card
          title="Now serving"
          value={counts.inProgress ? "In progress" : "-"}
          sub={
            counts.inProgress
              ? `${counts.inProgress.client_name || "Client"} • ${formatTime(
                  counts.inProgress.time
                )}`
              : "No active token"
          }
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="block">
            <div className="text-xs text-slate-400">Search</div>
            <input
              value={filters.q}
              onChange={(e) => setFilter({ q: e.target.value })}
              placeholder="Client name, reason, status..."
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
          </label>

          <label className="block">
            <div className="text-xs text-slate-400">Date</div>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilter({ date: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
          </label>

          <label className="block">
            <div className="text-xs text-slate-400">Status</div>
            <select
              value={filters.status}
              onChange={(e) => setFilter({ status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
        </div>

        {!endpoint ? (
          <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Live queue is not configured. Set <span className="font-semibold">VITE_TOKEN_QUEUE_ENDPOINT</span> to a backend endpoint, or use Demo Data.
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-100">Queue</div>
          {isDemo ? (
            <div className="text-xs text-amber-200 border border-amber-400/20 bg-amber-500/10 px-2 py-1 rounded-full">
              Demo mode
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-slate-300">Loading queue...</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="text-sm text-slate-200">No tokens to show.</div>
            <div className="mt-1 text-xs text-slate-400">
              Adjust filters or load demo data to preview the UI.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-950/40">
                <tr className="text-left text-slate-300">
                  <th className="px-4 py-3 font-medium">Token</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((x, idx) => {
                  const status = normalizeStatus(x.status);
                  const busy = actionId === x.id;

                  const canServe = status === "CONFIRMED" || status === "PENDING";
                  const canComplete = status === "IN_PROGRESS";
                  const canCancel = status !== "CANCELLED" && status !== "COMPLETED";

                  return (
                    <tr key={x.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-100 font-semibold">#{idx + 1}</td>
                      <td className="px-4 py-3 text-slate-200">
                        {x.client_name || x.client_email || "Client"}
                      </td>
                      <td className="px-4 py-3 text-slate-200">{formatDate(x.date)}</td>
                      <td className="px-4 py-3 text-slate-200">{formatTime(x.time)}</td>
                      <td className="px-4 py-3 text-slate-300 max-w-[360px] truncate" title={x.reason || ""}>
                        {x.reason || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill value={status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            disabled={!canServe || busy}
                            onClick={() => handleAction(x.id, "IN_PROGRESS")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              !canServe || busy
                                ? "border-white/10 bg-white/5 text-slate-500"
                                : "border-amber-400/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
                            }`}
                          >
                            {busy && canServe ? "Working..." : "Serve"}
                          </button>

                          <button
                            disabled={!canComplete || busy}
                            onClick={() => handleAction(x.id, "COMPLETED")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              !canComplete || busy
                                ? "border-white/10 bg-white/5 text-slate-500"
                                : "border-sky-400/20 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15"
                            }`}
                          >
                            {busy && canComplete ? "Working..." : "Complete"}
                          </button>

                          <button
                            disabled={!canCancel || busy}
                            onClick={() => handleAction(x.id, "CANCELLED")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              !canCancel || busy
                                ? "border-white/10 bg-white/5 text-slate-500"
                                : "border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15"
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenQueue;
