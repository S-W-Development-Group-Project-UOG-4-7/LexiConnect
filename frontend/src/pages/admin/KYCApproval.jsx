import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./KYCApproval.css";

const STATUSES = ["pending", "approved", "rejected"];

const statusLabel = (status) => {
  const s = (status || "").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default function KYCApproval() {
  const [activeTab, setActiveTab] = useState("pending");
  const [kycData, setKycData] = useState({
    pending: [],
    approved: [],
    rejected: [],
    all: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchStatus = async (status) => {
    const params = status && status !== "all" ? { status } : {};
    const res = await api.get("/api/admin/kyc", { params });
    return res.data || [];
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const [pending, approved, rejected] = await Promise.all(
        STATUSES.map((s) => fetchStatus(s))
      );
      const all = [...pending, ...approved, ...rejected];
      setKycData({ pending, approved, rejected, all });
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load KYC submissions.";
      setError(message);
      setKycData({ pending: [], approved: [], rejected: [], all: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs = useMemo(() => {
    const counts = {
      pending: kycData.pending.length,
      approved: kycData.approved.length,
      rejected: kycData.rejected.length,
      all: kycData.all.length,
    };
    return [
      { id: "pending", label: "Pending", count: counts.pending },
      { id: "approved", label: "Approved", count: counts.approved },
      { id: "rejected", label: "Rejected", count: counts.rejected },
      { id: "all", label: "All", count: counts.all },
    ];
  }, [kycData]);

  const getCurrentData = () => {
    if (activeTab === "all") return kycData.all;
    return kycData[activeTab] || [];
  };

  const handleAction = async (id, action) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/api/admin/kyc/${id}/${action}`);
      setSuccess(`KYC ${action}d successfully.`);
      await loadAll();
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        `Failed to ${action} KYC.`;
      setError(message);
    }
  };

  const handleApprove = (id) => handleAction(id, "approve");
  const handleReject = (id) => handleAction(id, "reject");

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <div className="kyc-approval-page">
      <div className="diamond-pattern"></div>

      <main className="kyc-approval-main">
        <div className="kyc-approval-container">
          <h1 className="kyc-page-title">KYC Approval</h1>

          {error && (
            <div className="kyc-alert kyc-alert-error">{error}</div>
          )}
          {success && (
            <div className="kyc-alert kyc-alert-success">{success}</div>
          )}

          <div className="kyc-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`kyc-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="kyc-loading">Loading KYC applications...</div>
          ) : (
            <div className="kyc-cards-list">
              {getCurrentData().map((kyc) => {
                const status = (kyc.status || "").toLowerCase();
                const isPending = status === "pending";
                return (
                  <div key={kyc.id} className="kyc-card">
                    <div className="kyc-card-left">
                      <div className="kyc-avatar">
                        <span className="kyc-avatar-icon">
                          {(kyc.full_name || "L")[0]}
                        </span>
                      </div>

                      <div className="kyc-info">
                        <div className="kyc-name-row">
                          <h3 className="kyc-name">
                            {kyc.full_name || `Lawyer #${kyc.user_id}`}
                          </h3>
                          <span className={`badge badge-${status}`}>
                            {statusLabel(status)}
                          </span>
                        </div>

                        <div className="kyc-contact-info">
                          <div className="kyc-contact-item">
                            <span className="kyc-contact-icon">📧</span>
                            <span>{kyc.email || "—"}</span>
                          </div>
                          <div className="kyc-contact-item">
                            <span className="kyc-contact-icon">📞</span>
                            <span>{kyc.contact_number || "—"}</span>
                          </div>
                        </div>

                        <div className="kyc-contact-info">
                          <div className="kyc-contact-item">
                            <span className="kyc-contact-icon">🆔</span>
                            <span>NIC: {kyc.nic_number || "—"}</span>
                          </div>
                          <div className="kyc-contact-item">
                            <span className="kyc-contact-icon">#</span>
                            <span>Bar ID: {kyc.bar_council_id || "—"}</span>
                          </div>
                        </div>

                        <div className="kyc-contact-item">
                          <span className="kyc-contact-icon">📍</span>
                          <span>{kyc.address || "—"}</span>
                        </div>

                        <div className="kyc-contact-item">
                          <span className="kyc-contact-icon">📄</span>
                          {kyc.certificate_url ? (
                            <a
                              href={kyc.certificate_url}
                              target="_blank"
                              rel="noreferrer"
                              className="kyc-doc-link"
                            >
                              View certificate
                            </a>
                          ) : (
                            <span>No certificate URL</span>
                          )}
                        </div>

                        <div className="kyc-date">
                          Submitted: {formatDate(kyc.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="kyc-card-right">
                      <div className="kyc-actions">
                        {isPending && (
                          <>
                            <button
                              className="btn btn-success approve-btn"
                              onClick={() => handleApprove(kyc.id)}
                              disabled={loading}
                            >
                              <span>✔</span>
                              <span>Approve</span>
                            </button>
                            <button
                              className="btn btn-danger reject-btn"
                              onClick={() => handleReject(kyc.id)}
                              disabled={loading}
                            >
                              <span>✕</span>
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {!isPending && (
                          <span className="text-sm text-gray-500">
                            Already {statusLabel(status)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {getCurrentData().length === 0 && !loading && (
                <div className="no-kyc-data">
                  <p>No {activeTab} KYC applications found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
