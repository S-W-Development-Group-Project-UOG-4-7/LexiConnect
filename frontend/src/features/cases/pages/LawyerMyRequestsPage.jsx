import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCaseRequests } from "../services/cases.service";
import "../../../pages/lawyer-ui.css";

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
        setRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to load requests.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatStatus = (status) => {
    const normalized = (status || "pending").toString().toLowerCase();
    const badgeClass =
      {
        approved: "green",
        pending: "amber",
        rejected: "red",
      }[normalized] || "amber";

    const chipClass =
      {
        approved: "approved",
        pending: "pending",
        rejected: "rejected",
      }[normalized] || "pending";

    const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return { normalized, badgeClass, chipClass, label };
  };

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString() : "Not available";

  return (
    <div className="lc-card">
      <div className="lc-header">
        <div className="lc-icon">CR</div>
        <div>
          <h1 className="lc-title">My Case Requests</h1>
          <p className="lc-subtitle">
            Track your access requests to client cases
          </p>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <p>Loading requests...</p>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="empty-state">
          <p>No requests yet</p>
          <p className="empty-sub">Your case access requests will appear here.</p>
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="lc-list">
          {requests.map((r) => {
            const status = formatStatus(r.status);
            const isApproved = status.normalized === "approved";
            const caseId = r.case_id || "";

            return (
              <div key={r.id} className="lc-list-card">
                <div className="lc-list-card-content">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div className="lc-list-card-title">
                      {r.case_title || `Case #${caseId || "Unknown"}`}
                    </div>
                    <span className={`lc-badge ${status.badgeClass}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="lc-list-card-meta">Case ID: {caseId || "Not available"}</div>
                  <div className="lc-list-card-meta">District: {r.district || "Not provided"}</div>
                  <div className="lc-list-card-meta">
                    Message: {r.message || "No message provided."}
                  </div>
                  <div className="lc-list-card-meta">
                    Requested: {formatDate(r.created_at)}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                  {isApproved ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/lawyer/cases/${caseId}`)}
                      className="lc-primary-btn"
                      style={{ height: "36px", fontSize: "0.85rem", padding: "0 1rem" }}
                      disabled={!caseId}
                    >
                      {caseId ? "Open Case" : "Case ID missing"}
                    </button>
                  ) : (
                    <span className={`lc-chip ${status.chipClass}`}>
                      {status.normalized === "rejected" ? "Rejected" : "Pending"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
