import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getMyKycStatus } from "../features/lawyer_kyc/services/lawyerKyc.service";
import "./lawyer-ui.css";

const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export default function LawyerDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [kpis, setKpis] = useState({
    pendingRequests: 0,
    incomingBookings: 0,
    tokenQueueToday: 0,
    kycStatus: "pending", // pending | approved | rejected | not_submitted
  });

  const [profile, setProfile] = useState({
    name: "Lawyer",
    email: "",
    phone: "",
    district: "",
    specialization: "",
    experienceYears: "",
    languages: "",
    avatarUrl: "",
    bio: "",
  });

  // Apprenticeship (your backend Swagger DOES NOT have /api/apprenticeship/summary)
  // So we keep this UI, but fill it via safe fallback (0s) unless you later add a backend summary endpoint.
  const [apprenticeship, setApprenticeship] = useState({
    openTasks: 0,
    unreadNotes: 0,
    latestTaskTitle: "",
    latestNoteSnippet: "",
  });

  // --- UI helpers ---
  const kycLabel = useMemo(() => {
    const s = (kpis.kycStatus || "pending").toLowerCase();
    if (s === "approved") return { text: "Approved", cls: "approved" };
    if (s === "rejected") return { text: "Rejected", cls: "rejected" };
    if (s === "not_submitted") return { text: "Not Submitted", cls: "not-submitted" };
    return { text: "Pending", cls: "pending" };
  }, [kpis.kycStatus]);

  const initials = useMemo(() => {
    const base = (profile.name || profile.email || "Lawyer").trim();
    const parts = base.split(/\s+/);
    const a = parts[0]?.[0] || "L";
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (a + b).toUpperCase();
  }, [profile.name, profile.email]);

  const profileCompletion = useMemo(() => {
    const fields = [
      !!profile.name,
      !!profile.email,
      !!profile.phone,
      !!profile.district,
      !!profile.specialization,
      !!profile.experienceYears,
      !!profile.languages,
      !!profile.bio,
      !!profile.avatarUrl,
    ];
    const done = fields.filter(Boolean).length;
    return Math.round((done / fields.length) * 100);
  }, [profile]);

  const topNextAction = useMemo(() => {
    if ((kpis.kycStatus || "").toLowerCase() !== "approved") {
      return {
        title: "Complete KYC verification",
        desc: "Verified lawyers gain higher trust and better visibility to clients.",
        cta: "Go to KYC",
        to: "/lawyer/kyc",
      };
    }
    if (profileCompletion < 80) {
      return {
        title: "Complete your public profile",
        desc: "A strong profile helps clients choose you faster.",
        cta: "Edit Profile",
        to: "/lawyer/profile/edit",
      };
    }
    if (safeNum(kpis.incomingBookings) > 0) {
      return {
        title: "Respond to incoming bookings",
        desc: "Accept or reject requests to keep your schedule accurate.",
        cta: "Open Incoming Bookings",
        to: "/lawyer/bookings/incoming",
      };
    }
    return {
      title: "Set your availability",
      desc: "Publish weekly slots so clients can book consultations.",
      cta: "Open Availability",
      to: "/lawyer/availability",
    };
  }, [kpis.kycStatus, profileCompletion, kpis.incomingBookings]);

  // --- Data load ---
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setErr("");

      try {
        /**
         * IMPORTANT FIXES:
         * 1) incoming bookings endpoint:
         *    - Your Swagger shows: GET /api/bookings/lawyer/incoming
         *    - The old one /api/bookings/incoming?status=pending caused 422/404
         *    - We fetch /bookings/lawyer/incoming then filter "pending" in frontend.
         *
         * 2) apprenticeship summary endpoint:
         *    - /api/apprenticeship/summary is NOT in Swagger (404)
         *    - We do NOT call it. We keep apprenticeship UI as zeros.
         *
         * 3) auth/me endpoint:
         *    - Use "/auth/me" (your api.js will prefix /api => /api/auth/me)
         */
        const results = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/bookings/lawyer/incoming"),
          api.get("/queue/today"),
          api.get("/cases/requests/my"),
          getMyKycStatus(),
        ]);

        if (!mounted) return;

        const [meRes, incomingRes, queueRes, requestsRes, kycRes] = results;

        // If token is missing/expired, these will 401. Redirect to login.
        const isUnauthorized = [meRes, incomingRes, queueRes, requestsRes, kycRes].some(
          (r) => r.status === "rejected" && r.reason?.response?.status === 401
        );
        if (isUnauthorized) {
          setErr("Session expired. Please login again.");
          // Optional: send user to login after a tiny delay so banner renders
          setTimeout(() => {
            navigate("/login");
          }, 150);
          return;
        }

        // --- ME ---
        if (meRes.status === "fulfilled") {
          const me = meRes.value?.data || {};
          setProfile((p) => ({
            ...p,
            email: me.email || p.email,
            name: me.full_name || me.name || (me.email ? me.email.split("@")[0] : p.name),
            phone: me.phone || p.phone,
          }));
        }

        // --- Incoming bookings (filter pending locally) ---
        if (incomingRes.status === "fulfilled") {
          const list = incomingRes.value?.data || [];
          const arr = Array.isArray(list) ? list : list?.items || [];

          const pendingCount = Array.isArray(arr)
            ? arr.filter((b) => (b.status || "").toLowerCase() === "pending").length
            : 0;

          setKpis((prev) => ({
            ...prev,
            incomingBookings: pendingCount,
          }));
        }

        // --- Queue today ---
        if (queueRes.status === "fulfilled") {
          const list = queueRes.value?.data || [];
          const arr = Array.isArray(list) ? list : list?.items || [];
          setKpis((prev) => ({
            ...prev,
            tokenQueueToday: Array.isArray(arr) ? arr.length : 0,
          }));
        }

        // --- Requests (pending) ---
        if (requestsRes.status === "fulfilled") {
          const list = requestsRes.value?.data || [];
          const arr = Array.isArray(list) ? list : list?.items || [];

          const pendingCount = Array.isArray(arr)
            ? arr.filter((r) => (r.status || "").toLowerCase() === "pending").length
            : 0;

          setKpis((prev) => ({
            ...prev,
            pendingRequests: pendingCount,
          }));
        }

        // --- Apprenticeship summary (no endpoint) ---
        // Keep as zeros unless you add a backend summary route later.
        setApprenticeship({
          openTasks: 0,
          unreadNotes: 0,
          latestTaskTitle: "",
          latestNoteSnippet: "",
        });

        // --- KYC ---
        if (kycRes.status === "fulfilled") {
          const status = kycRes.value || "not_submitted";
          setKpis((prev) => ({
            ...prev,
            kycStatus: String(status || "not_submitted").toLowerCase(),
          }));
        } else {
          setKpis((prev) => ({
            ...prev,
            kycStatus: "not_submitted",
          }));
        }

        // Non-optional failures (show banner but keep UI usable)
        const nonOptionalFailures = [meRes, incomingRes, queueRes, requestsRes].some(
          (res) => res.status === "rejected" && res.reason?.response?.status !== 404
        );
        if (nonOptionalFailures) {
          setErr("Some dashboard data failed to load.");
        }
      } catch (e) {
        if (!mounted) return;
        setErr("Failed to load dashboard data.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const onUploadPhoto = () => navigate("/lawyer/profile/edit");

  const kpiNav = {
    pendingRequests: "/lawyer/cases/requests",
    incomingBookings: "/lawyer/bookings/incoming",
    tokenQueueToday: "/lawyer/token-queue",
    kyc: "/lawyer/kyc",
  };

  return (
    <div className="lc-page">
      <div className="lc-card">
        {/* Header */}
        <div className="dash-head compact">
          <div>
            <h1 className="dash-title">Lawyer Dashboard</h1>
            <p className="dash-subtitle">
              Manage bookings, availability, tokens, and your professional presence.
            </p>
          </div>

          <div className="dash-head-actions">
            <button
              className="dash-action-btn primary"
              onClick={() => navigate("/lawyer/cases/feed")}
            >
              Open Case Feed
            </button>
            <button className="dash-action-btn" onClick={() => navigate("/lawyer/cases/requests")}>
              My Requests
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {!!err && (
          <div className="dash-alert dash-alert-error">
            <b>Dashboard:</b> {err}
            <button
              className="dash-action-btn"
              style={{ marginLeft: 12 }}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Layout */}
        <div className="dash-grid tidy">
          {/* LEFT */}
          <div className="dash-left">
            {/* KPI Row */}
            <div className={`dash-kpis tidy ${loading ? "is-loading" : ""}`}>
              <button className="dash-kpi dash-kpi-button" onClick={() => navigate(kpiNav.pendingRequests)}>
                <div className="dash-kpi-label">Pending Requests</div>
                <div className="dash-kpi-value">
                  {loading ? <span className="dash-skeleton dash-skeleton-lg" /> : kpis.pendingRequests}
                </div>
                <div className="dash-kpi-meta">Waiting for client approval</div>
              </button>

              <button className="dash-kpi dash-kpi-button" onClick={() => navigate(kpiNav.incomingBookings)}>
                <div className="dash-kpi-label">Incoming Bookings</div>
                <div className="dash-kpi-value">
                  {loading ? <span className="dash-skeleton dash-skeleton-lg" /> : kpis.incomingBookings}
                </div>
                <div className="dash-kpi-meta">Need accept / reject</div>
              </button>

              <button className="dash-kpi dash-kpi-button" onClick={() => navigate(kpiNav.tokenQueueToday)}>
                <div className="dash-kpi-label">Token Queue Today</div>
                <div className="dash-kpi-value">
                  {loading ? <span className="dash-skeleton dash-skeleton-lg" /> : kpis.tokenQueueToday}
                </div>
                <div className="dash-kpi-meta">Consultations for today</div>
              </button>

              <button className="dash-kpi dash-kpi-button" onClick={() => navigate(kpiNav.kyc)}>
                <div className="dash-kpi-label">KYC Status</div>
                <div className="dash-kpi-value">
                  {loading ? (
                    <span className="dash-skeleton dash-skeleton-sm" />
                  ) : (
                    <span className={`lc-chip ${kycLabel.cls}`}>{kycLabel.text}</span>
                  )}
                </div>
                <div className="dash-kpi-meta">Verification & trust</div>
              </button>
            </div>

            {/* Today */}
            <div className="dash-section">
              <div className="dash-section-title">Today</div>
              <div className="dash-mini-card tidy">
                <div className="dash-mini-title">{loading ? "Loading..." : topNextAction.title}</div>
                <div className="dash-mini-sub">{loading ? "Fetching your latest data..." : topNextAction.desc}</div>

                <div className="dash-inline-actions">
                  <button
                    className="dash-action-btn primary"
                    onClick={() => navigate(topNextAction.to)}
                    disabled={loading}
                  >
                    {topNextAction.cta}
                  </button>
                  <button
                    className="dash-action-btn"
                    onClick={() => navigate("/lawyer/cases/feed")}
                    disabled={loading}
                  >
                    Browse Case Feed
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dash-section">
              <div className="dash-section-title">Quick Actions</div>

              <div className="dash-actions tidy">
                <button className="dash-tile" onClick={() => navigate("/lawyer/bookings/incoming")}>
                  <div className="dash-tile-title">Incoming Bookings</div>
                  <div className="dash-tile-sub">Accept / reject booking requests</div>
                </button>

                <button className="dash-tile" onClick={() => navigate("/lawyer/availability")}>
                  <div className="dash-tile-title">Availability</div>
                  <div className="dash-tile-sub">Set weekly schedule</div>
                </button>

                <button className="dash-tile" onClick={() => navigate("/lawyer/token-queue")}>
                  <div className="dash-tile-title">Token Queue</div>
                  <div className="dash-tile-sub">Manage walk-in consultations</div>
                </button>

                <button className="dash-tile" onClick={() => navigate("/lawyer/branches")}>
                  <div className="dash-tile-title">Branches</div>
                  <div className="dash-tile-sub">Office locations & addresses</div>
                </button>

                <button className="dash-tile" onClick={() => navigate("/lawyer/services")}>
                  <div className="dash-tile-title">Services</div>
                  <div className="dash-tile-sub">Practice services (fees discussed privately)</div>
                </button>

                <button className="dash-tile" onClick={() => navigate("/lawyer/checklist")}>
                  <div className="dash-tile-title">Checklists</div>
                  <div className="dash-tile-sub">Case templates & steps</div>
                </button>

                <button className="dash-tile" onClick={() => navigate("/lawyer/public-profile")}>
                  <div className="dash-tile-title">Public Profile</div>
                  <div className="dash-tile-sub">Preview what clients see</div>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="dash-right">
            {/* Profile */}
            <div className="dash-profile tidy">
              <div className="dash-profile-top">
                <div className="dash-avatar">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="avatar" />
                  ) : (
                    <div className="dash-avatar-fallback">{initials}</div>
                  )}
                </div>

                <div className="dash-profile-meta">
                  <div className="dash-profile-name">
                    {loading ? <span className="dash-skeleton dash-skeleton-md" /> : profile.name || "Lawyer"}
                  </div>
                  <div className="dash-profile-line">
                    {loading ? <span className="dash-skeleton dash-skeleton-sm" /> : profile.email || "No email set"}
                  </div>
                  <div className="dash-profile-line">
                    {loading ? <span className="dash-skeleton dash-skeleton-sm" /> : profile.phone || "No phone set"}
                  </div>
                </div>
              </div>

              <div className="dash-profile-hint">
                Profile completion: <b>{loading ? "-" : `${profileCompletion}%`}</b>
              </div>

              <div className="dash-profile-actions">
                <button
                  className="dash-action-btn primary"
                  onClick={() => navigate("/lawyer/profile/edit")}
                  disabled={loading}
                >
                  Edit Profile
                </button>
                <button
                  className="dash-action-btn"
                  onClick={() => navigate("/lawyer/public-profile")}
                  disabled={loading}
                >
                  View Public Profile
                </button>
                <button className="dash-action-btn" onClick={onUploadPhoto} disabled={loading}>
                  Upload Photo
                </button>
              </div>

              <div className="dash-profile-hint">Tip: A complete profile improves trust and conversion.</div>
            </div>

            {/* Apprenticeship (kept, but no backend summary endpoint so it shows 0s) */}
            <div className="dash-mini tidy" style={{ marginTop: 12 }}>
              <div className="dash-section-title">Apprenticeship</div>

              <div className="dash-mini-card tidy">
                <div className="dash-mini-title">Tasks & Notes</div>
                <div className="dash-mini-sub">
                  {loading ? (
                    "Loading..."
                  ) : (
                    <>
                      <div>
                        Open tasks: <b>{apprenticeship.openTasks}</b>
                      </div>
                      <div>
                        Unread notes: <b>{apprenticeship.unreadNotes}</b>
                      </div>
                      {apprenticeship.latestTaskTitle ? <div>Latest task: {apprenticeship.latestTaskTitle}</div> : null}
                      {apprenticeship.latestNoteSnippet ? <div>Latest note: {apprenticeship.latestNoteSnippet}</div> : null}
                    </>
                  )}
                </div>

                <div className="dash-inline-actions">
                  <button
                    className="dash-action-btn primary"
                    onClick={() => navigate("/lawyer/apprenticeship", { state: { tab: "assign" } })}
                    disabled={loading}
                  >
                    Assign Tasks
                  </button>
                  <button
                    className="dash-action-btn"
                    onClick={() => navigate("/lawyer/apprenticeship", { state: { tab: "notes" } })}
                    disabled={loading}
                  >
                    Review Notes
                  </button>
                </div>
              </div>
            </div>

            {/* Shortcuts */}
            <div className="dash-mini tidy" style={{ marginTop: 12 }}>
              <div className="dash-section-title">Shortcuts</div>

              <div className="dash-mini-card tidy">
                <div className="dash-mini-title">Account Settings</div>
                <div className="dash-mini-sub">Password & preferences.</div>
                <button className="dash-action-btn" onClick={() => navigate("/lawyer/settings")} disabled={loading}>
                  Open Settings
                </button>
              </div>

              <div className="dash-mini-card tidy" style={{ marginTop: 12 }}>
                <div className="dash-mini-title">KYC Verification</div>
                <div className="dash-mini-sub">Keep KYC updated for trust with clients.</div>
                <button className="dash-action-btn primary" onClick={() => navigate("/lawyer/kyc")} disabled={loading}>
                  Go to KYC
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* end grid */}
      </div>
    </div>
  );
}
