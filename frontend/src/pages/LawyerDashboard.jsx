import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./lawyer-ui.css";

export default function LawyerDashboard() {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState({
    pendingRequests: 0,
    upcomingBookings: 0,
    tokenQueueToday: 0,
    kycStatus: "pending",
  });

  const [profile, setProfile] = useState({
    name: "Lawyer",
    email: "lawyer@lexiconnect.local",
    phone: "+94 77 123 4567",
    avatarUrl: "",
  });

  useEffect(() => {
    setKpis((p) => ({
      ...p,
    }));
  }, []);

  const kycLabel = useMemo(() => {
    const s = (kpis.kycStatus || "pending").toLowerCase();
    if (s === "approved") return { text: "Approved", cls: "approved" };
    if (s === "rejected") return { text: "Rejected", cls: "rejected" };
    if (s === "not_submitted") return { text: "Not Submitted", cls: "not-submitted" };
    return { text: "Pending", cls: "pending" };
  }, [kpis.kycStatus]);

  const onUploadPhoto = () => {
    alert("Photo upload will be connected to backend soon.");
  };

  return (
    <div className="dash-shell">
      <div className="dash-head">
        <div>
          <h1 className="dash-title">Lawyer Dashboard</h1>
          <p className="dash-subtitle">Manage cases, bookings, and your professional profile.</p>
        </div>

        <div className="dash-head-actions">
          <button
            className="dash-action-btn primary"
            onClick={() => navigate("/lawyer/cases/feed")}
          >
            Open Case Feed
          </button>
          <button
            className="dash-action-btn"
            onClick={() => navigate("/lawyer/cases/requests")}
          >
            My Requests
          </button>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-left">
          <div className="dash-kpis">
            <div className="dash-kpi">
              <div className="dash-kpi-label">Pending Requests</div>
              <div className="dash-kpi-value">{kpis.pendingRequests}</div>
              <div className="dash-kpi-meta">Cases awaiting client approval</div>
            </div>

            <div className="dash-kpi">
              <div className="dash-kpi-label">Upcoming Bookings</div>
              <div className="dash-kpi-value">{kpis.upcomingBookings}</div>
              <div className="dash-kpi-meta">Next 7 days</div>
            </div>

            <div className="dash-kpi">
              <div className="dash-kpi-label">Token Queue Today</div>
              <div className="dash-kpi-value">{kpis.tokenQueueToday}</div>
              <div className="dash-kpi-meta">Today's consultation queue</div>
            </div>

            <div className="dash-kpi">
              <div className="dash-kpi-label">KYC Status</div>
              <div className="dash-kpi-value">
                <span className={`lc-chip ${kycLabel.cls}`}>{kycLabel.text}</span>
              </div>
              <div className="dash-kpi-meta">Verification for platform trust</div>
            </div>
          </div>

          <div className="dash-section">
            <div className="dash-section-title">Quick Actions</div>

            <div className="dash-actions">
              <button className="dash-tile" onClick={() => navigate("/lawyer/bookings/incoming")}>
                <div className="dash-tile-title">Incoming Bookings</div>
                <div className="dash-tile-sub">Accept / Reject bookings</div>
              </button>

              <button className="dash-tile" onClick={() => navigate("/lawyer/availability")}>
                <div className="dash-tile-title">Availability</div>
                <div className="dash-tile-sub">Manage weekly schedule</div>
              </button>

              <button className="dash-tile" onClick={() => navigate("/lawyer/apprentices")}>
                <div className="dash-tile-title">Apprenticeship</div>
                <div className="dash-tile-sub">Assign and review apprentice work</div>
              </button>

              <button className="dash-tile" onClick={() => navigate("/lawyer/branches")}>
                <div className="dash-tile-title">Branches</div>
                <div className="dash-tile-sub">Office locations and addresses</div>
              </button>

              <button className="dash-tile" onClick={() => navigate("/lawyer/services")}>
                <div className="dash-tile-title">Services</div>
                <div className="dash-tile-sub">Packages and pricing</div>
              </button>

              <button className="dash-tile" onClick={() => navigate("/lawyer/checklist")}>
                <div className="dash-tile-title">Checklist</div>
                <div className="dash-tile-sub">Templates and case steps</div>
              </button>

              <button className="dash-tile" onClick={() => navigate("/lawyer/kyc")}>
                <div className="dash-tile-title">KYC</div>
                <div className="dash-tile-sub">Submit / view verification</div>
              </button>

              <button className="dash-tile" onClick={() => navigate("/lawyer/public-profile")}>
                <div className="dash-tile-title">Public Profile</div>
                <div className="dash-tile-sub">What clients see</div>
              </button>
            </div>
          </div>
        </div>

        <div className="dash-right">
          <div className="dash-profile">
            <div className="dash-profile-top">
              <div className="dash-avatar">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="avatar" />
                ) : (
                  <div className="dash-avatar-fallback">User</div>
                )}
              </div>

              <div className="dash-profile-meta">
                <div className="dash-profile-name">{profile.name}</div>
                <div className="dash-profile-line">{profile.email}</div>
                <div className="dash-profile-line">{profile.phone}</div>
              </div>
            </div>

            <div className="dash-profile-actions">
              <button
                className="dash-action-btn primary"
                onClick={() => navigate("/lawyer/profile/edit")}
              >
                Edit Profile
              </button>
              <button
                className="dash-action-btn"
                onClick={() => navigate("/lawyer/public-profile")}
              >
                View Public Profile
              </button>
              <button className="dash-action-btn" onClick={onUploadPhoto}>
                Upload Photo
              </button>
            </div>

            <div className="dash-profile-hint">
              Tip: A complete profile increases trust and improves client conversion.
            </div>
          </div>

          <div className="dash-mini">
            <div className="dash-section-title">Next Steps</div>
            <div className="dash-mini-card">
              <div className="dash-mini-title">Complete KYC</div>
              <div className="dash-mini-sub">
                Verified lawyers appear higher in search and gain more bookings.
              </div>
              <button className="dash-action-btn primary" onClick={() => navigate("/lawyer/kyc")}>
                Go to KYC
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
