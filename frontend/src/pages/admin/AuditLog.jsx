import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./AuditLog.css";

const ACTIONS = [
  "All Actions",
  "KYC_APPROVED",
  "KYC_REJECTED",
  "DISPUTE_RESOLVED",
  "BOOKING_CONFIRMED",
  "BOOKING_REJECTED",
  "BOOKING_CANCELLED",
];

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("All Actions");

  // simple debounce
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        days: 7,
        limit: 50,
      };
      if (debouncedSearch) params.q = debouncedSearch;
      if (action && action !== "All Actions") params.action = action;

      const res = await api.get("/api/admin/audit-logs", { params });
      setLogs(res.data || []);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load audit logs.";
      setError(msg);
      setLogs([]);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        window.location.href = "/not-authorized";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, action]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return logs.filter((l) => {
      const d = l.created_at ? new Date(l.created_at).toDateString() : "";
      return d === today;
    }).length;
  }, [logs]);

  const exportCSV = () => {
    if (!logs.length) return;
    const headers = ["id", "created_at", "user_email", "action", "description"];
    const rows = logs.map((l) =>
      headers
        .map((h) => {
          const v = l[h] ?? "";
          const escaped = String(v).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "audit_logs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    if (!logs.length) return;
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "audit_logs.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "—";
    try {
      const d = new Date(ts);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return ts;
    }
  };

  return (
    <div className="audit-log-page">
      <div className="diamond-pattern"></div>

      <main className="audit-log-main">
        <div className="audit-log-container">
          <h1 className="audit-page-title">Case Audit Log</h1>

          {error && <div className="audit-error-banner">{error}</div>}

          <div className="audit-search-card">
            <div className="audit-search-wrapper">
              <svg
                className="audit-search-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              <input
                type="text"
                className="audit-search-input"
                placeholder="Search by user, action, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="audit-filter-wrapper">
              <svg
                className="audit-filter-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>

              <select
                className="audit-filter-select bg-slate-800 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                {ACTIONS.map((a) => (
                  <option
                    key={a}
                    value={a}
                    className="bg-slate-800 text-slate-100"
                    style={{ backgroundColor: "#0f172a", color: "#e2e8f0" }}
                  >
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="audit-summary-grid">
            <div className="audit-summary-card">
              <div className="summary-label">Total Entries</div>
              <div className="summary-value">{loading ? "…" : logs.length}</div>
            </div>
            <div className="audit-summary-card">
              <div className="summary-label">Today</div>
              <div className="summary-value">{loading ? "…" : todayCount}</div>
            </div>
            <div className="audit-summary-card">
              <div className="summary-label">Unique Users</div>
              <div className="summary-value">
                {loading ? "…" : new Set(logs.map((l) => l.user_email || "-")).size}
              </div>
            </div>
            <div className="audit-summary-card">
              <div className="summary-label">Action Types</div>
              <div className="summary-value">
                {loading ? "…" : new Set(logs.map((l) => l.action || "-")).size}
              </div>
            </div>
          </div>

          <div className="audit-table-card">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="4" className="audit-skeleton-row">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading &&
                  logs.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <div className="audit-timestamp">
                          <span className="timestamp-icon">📅</span>
                          <div className="timestamp-details">
                            <span className="timestamp-date">
                              {formatTimestamp(entry.created_at)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="audit-user">
                          <span className="user-icon">👤</span>
                          <span>{entry.user_email || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`audit-action-badge action-${(entry.action || "")
                            .toLowerCase()
                            .replace("_", "-")}`}
                        >
                          {entry.action}
                        </span>
                      </td>
                      <td>
                        <span className="audit-description">{entry.description}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {!loading && logs.length === 0 && (
              <div className="no-audit-data">
                <p>No audit entries found.</p>
              </div>
            )}
          </div>

          <div className="audit-export-card">
            <h3 className="export-title">Export Options</h3>
            <div className="export-buttons">
              <button
                className="btn btn-primary export-btn export-csv"
                onClick={exportCSV}
                disabled={!logs.length}
              >
                Export as CSV
              </button>
              <button
                className="btn btn-secondary export-btn export-json"
                onClick={exportJSON}
                disabled={!logs.length}
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
