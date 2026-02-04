import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { lawyerListIncomingBookings } from "../services/bookings";
import { getCaseFeed, getMyCaseRequests } from "../features/cases/services/cases.service";
import { getMyKyc } from "../features/lawyer_kyc/services/lawyerKyc.service";
import "./lawyer-ui.css";

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState("");

  const [caseFeed, setCaseFeed] = useState([]);
  const [caseFeedLoading, setCaseFeedLoading] = useState(true);
  const [caseFeedError, setCaseFeedError] = useState("");
  const [caseSearch, setCaseSearch] = useState("");

  // Load minimal identity from localStorage (safe default)
  useEffect(() => {
    const email = user?.email || localStorage.getItem("email") || "";
    const avatarUrl = localStorage.getItem("avatar") || "";
    const specialization = localStorage.getItem("specialization") || "";
    const phone = localStorage.getItem("phone") || "";

    setProfile((p) => ({
      ...p,
      email,
      avatarUrl,
      specialization,
      phone,
      name: user?.full_name || (email ? email.split("@")[0] : p.name),
    }));
  }, [user]);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setKpisLoading(true);
      setKpisError("");
      try {
        const todayKey = new Date().toISOString().slice(0, 10);
        const tokenQueueEndpoint =
          import.meta.env.VITE_TOKEN_QUEUE_ENDPOINT || "/api/token-queue";
        const slotsEndpoint = `${tokenQueueEndpoint}/slots`;

        const [incoming, kycRes, tokenRes, requests] = await Promise.all([
          lawyerListIncomingBookings("all"),
          getMyKyc(),
          api.get(`${slotsEndpoint}?date=${todayKey}`),
          getMyCaseRequests(),
        ]);

        const incomingList = Array.isArray(incoming) ? incoming : [];
        const incomingPending = incomingList.filter(
          (b) => String(b?.status || "").toUpperCase() === "PENDING"
        ).length;

        const kycStatus =
          kycRes?.data?.status || kycRes?.status || "not_submitted";

        const slots = Array.isArray(tokenRes?.data?.slots)
          ? tokenRes.data.slots
          : [];
        const tokenCount = slots.reduce(
          (sum, slot) => sum + (Array.isArray(slot?.bookings) ? slot.bookings.length : 0),
          0
        );

        const requestList = Array.isArray(requests) ? requests : [];
        const pendingRequestStatuses = new Set([
          "PENDING",
          "REQUESTED",
          "WAITING_CLIENT_APPROVAL",
          "AWAITING_CLIENT_APPROVAL",
        ]);
        const pendingRequests = requestList.filter((r) =>
          pendingRequestStatuses.has(String(r?.status || "").toUpperCase())
        ).length;

        if (!active) return;
        setKpis({
          pendingRequests,
          incomingBookings: incomingPending,
          tokenQueueToday: tokenCount,
          kycStatus,
        });
      } catch (err) {
        if (!active) return;
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load dashboard metrics.";
        setKpisError(message);
      } finally {
        if (active) setKpisLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadCaseFeed = async () => {
      setCaseFeedLoading(true);
      setCaseFeedError("");
      try {
        const data = await getCaseFeed();
        if (!active) return;
        setCaseFeed(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load case feed.";
        setCaseFeedError(message);
        setCaseFeed([]);
      } finally {
        if (active) setCaseFeedLoading(false);
      }
    };

    loadCaseFeed();
    return () => {
      active = false;
    };
  }, []);

  const kycLabel = useMemo(() => {
    const s = (kpis.kycStatus || "pending").toLowerCase();
    if (s === "approved") return { text: "Approved", cls: "approved" };
    if (s === "rejected") return { text: "Rejected", cls: "rejected" };
    if (s === "not_submitted") return { text: "Not Submitted", cls: "not-submitted" };
    return { text: "Pending", cls: "pending" };
  }, [kpis.kycStatus]);

  const renderKpiValue = (value) => (kpisLoading ? 0 : value ?? 0);

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

  const caseFeedCounts = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const statusOpen = new Set(["OPEN", "PENDING", "NEW"]);
    const newToday = caseFeed.filter(
      (c) => c?.created_at && String(c.created_at).slice(0, 10) === todayKey
    ).length;
    const openCount = caseFeed.filter((c) =>
      statusOpen.has(String(c?.status || "").toUpperCase())
    ).length;
    const specialization = (profile.specialization || "").trim().toLowerCase();
    const matched =
      specialization.length > 0
        ? caseFeed.filter((c) => {
            const label = String(
              c?.specialization?.name || c?.specialization_name || c?.category || ""
            ).toLowerCase();
            return label.includes(specialization);
          }).length
        : null;
    return { newToday, openCount, matched };
  }, [caseFeed, profile.specialization]);

  const filteredCaseFeed = useMemo(() => {
    if (!caseSearch.trim()) return caseFeed;
    const term = caseSearch.trim().toLowerCase();
    return caseFeed.filter((c) => {
      const haystack = [
        c?.title,
        c?.category,
        c?.district,
        c?.specialization?.name,
        c?.specialization_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [caseFeed, caseSearch]);

  const previewCases = useMemo(() => filteredCaseFeed.slice(0, 5), [filteredCaseFeed]);

  const formatCaseTime = (value) => {
    if (!value) return "No data yet";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "No data yet";
    return parsed.toLocaleString();
  };

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
    return {
      title: "Review incoming bookings",
      desc: "Respond quickly to improve client satisfaction and conversion.",
      cta: "Open Incoming Bookings",
      to: "/lawyer/bookings/incoming",
    };
  }, [kpis.kycStatus, profileCompletion]);

  return (
    // ✅ Use the same wrapper that other lawyer pages use to avoid the “extra box”
    <div className="lc-page dash-page min-h-screen">
      <div className="dash-container mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lc-card dash-shell-surface dash-panel">
        <div className="dash-shell-bg" aria-hidden="true" />
        <div className="dash-shell-content p-6 sm:p-8">
        {/* Header */}
        <div className="dash-head compact flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="dash-title">Lawyer Dashboard</h1>
            <p className="dash-subtitle">
              Review new cases, manage bookings, and track today's work.
            </p>
          </div>

          <div className="dash-head-actions flex flex-wrap gap-3">
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

        {/* Layout */}
        <div className="dash-grid tidy grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="dash-left dash-col-main">
            {/* Case Feed Hero */}
            <section className="dash-hero-card">
              <div className="dash-hero-head">
                <div>
                  <div className="dash-hero-eyebrow">Case Feed</div>
                  <h2 className="dash-hero-title">New & Matching Cases</h2>
                </div>
                <div className="dash-hero-search">
                  <input
                    className="dash-search-input"
                    placeholder="Search cases..."
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                    disabled={caseFeedLoading || caseFeed.length === 0}
                  />
                </div>
              </div>

              <div className="dash-hero-chips">
                <span className="dash-chip">
                  New today: {caseFeedLoading ? 0 : caseFeedCounts.newToday}
                </span>
                <span className="dash-chip">
                  Open: {caseFeedLoading ? 0 : caseFeedCounts.openCount}
                </span>
                {caseFeedCounts.matched != null && (
                  <span className="dash-chip">
                    Matched to your specialization: {caseFeedLoading ? 0 : caseFeedCounts.matched}
                  </span>
                )}
              </div>

              {caseFeedError && (
                <div className="dash-inline-error">{caseFeedError}</div>
              )}

              <div className="dash-case-list">
                {caseFeedLoading &&
                  Array.from({ length: 5 }).map((_, idx) => (
                    <div key={`case-skeleton-${idx}`} className="dash-case-row skeleton" />
                  ))}

                {!caseFeedLoading && previewCases.length === 0 && (
                  <div className="dash-empty">
                    No cases yet. Try clearing the search or open the full feed.
                  </div>
                )}

                {!caseFeedLoading &&
                  previewCases.map((c) => (
                    <div key={c.id} className="dash-case-row">
                      <div className="dash-case-main">
                        <div className="dash-case-title">{c.title || "Untitled case"}</div>
                        <div className="dash-case-meta">
                          <span>
                            {c.specialization?.name ||
                              c.specialization_name ||
                              c.category ||
                              "No data yet"}
                          </span>
                          <span>•</span>
                          <span>{c.district || "No data yet"}</span>
                          <span>•</span>
                          <span>{formatCaseTime(c.created_at)}</span>
                        </div>
                      </div>
                      <div className="dash-case-actions">
                        <span className={`dash-status ${String(c?.status || "").toLowerCase()}`}>
                          {c.status || "Open"}
                        </span>
                        <button
                          className="dash-action-btn"
                          onClick={() => navigate(`/lawyer/public/cases/${c.id}`)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="dash-hero-footer">
                <button
                  className="dash-link-btn"
                  onClick={() => navigate("/lawyer/cases/feed")}
                >
                  View all cases
                </button>
                <div className="dash-hero-note">
                  Cases are filtered by your specialization (if set).
                </div>
              </div>
            </section>

            {/* Overview KPIs */}
            <section className="dash-section overflow-hidden">
              <div className="dash-section-title">Overview</div>
              <div className="dash-kpis tidy grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full min-w-0">
                <div className="dash-kpi min-w-0 w-full">
                  <div className="dash-kpi-label">Pending Requests</div>
                  <div className="dash-kpi-value">
                    {renderKpiValue(kpis.pendingRequests)}
                  </div>
                  <div className="dash-kpi-meta">Waiting for client approval</div>
                </div>

                <div className="dash-kpi min-w-0 w-full">
                  <div className="dash-kpi-label">Incoming Bookings</div>
                  <div className="dash-kpi-value">
                    {renderKpiValue(kpis.incomingBookings)}
                  </div>
                  <div className="dash-kpi-meta">Need accept / reject</div>
                </div>

                <div className="dash-kpi min-w-0 w-full">
                  <div className="dash-kpi-label">Token Queue Today</div>
                  <div className="dash-kpi-value">
                    {renderKpiValue(kpis.tokenQueueToday)}
                  </div>
                  <div className="dash-kpi-meta">Consultations for today</div>
                </div>

                <div className="dash-kpi min-w-0 w-full">
                  <div className="dash-kpi-label">KYC Status</div>
                  <div className="dash-kpi-value">
                    <span className={`lc-chip ${kycLabel.cls}`}>{kycLabel.text}</span>
                  </div>
                  <div className="dash-kpi-meta">Verification & trust</div>
                </div>
              </div>
            </section>

            {/* Today's Work */}
            <section className="dash-work-strip">
              <div className="dash-section-title">Today's Work</div>
              <div className="dash-work-cards">
                <div className="dash-work-card">
                  <div className="dash-work-label">Incoming Bookings</div>
                  <div className="dash-work-value">{renderKpiValue(kpis.incomingBookings)}</div>
                  <button
                    className="dash-action-btn"
                    onClick={() => navigate("/lawyer/bookings/incoming")}
                  >
                    Review
                  </button>
                </div>
                <div className="dash-work-card">
                  <div className="dash-work-label">Token Queue Today</div>
                  <div className="dash-work-value">{renderKpiValue(kpis.tokenQueueToday)}</div>
                  <button
                    className="dash-action-btn"
                    onClick={() => navigate("/lawyer/token-queue")}
                  >
                    Go
                  </button>
                </div>
                <div className="dash-work-card">
                  <div className="dash-work-label">Pending Requests</div>
                  <div className="dash-work-value">{renderKpiValue(kpis.pendingRequests)}</div>
                  <button
                    className="dash-action-btn"
                    onClick={() => navigate("/lawyer/cases/requests")}
                  >
                    Open
                  </button>
                </div>
              </div>
              {kpisError && (
                <div className="dash-inline-error">{kpisError}</div>
              )}
            </section>

            <section className="dash-section">
              <div className="dash-section-title">Next Action</div>
              <div className="dash-mini-card tidy">
                <div className="dash-mini-title">{topNextAction.title}</div>
                <div className="dash-mini-sub">{topNextAction.desc}</div>
                <div className="dash-inline-actions">
                  <button
                    className="dash-action-btn primary"
                    onClick={() => navigate(topNextAction.to)}
                  >
                    {topNextAction.cta}
                  </button>
                </div>
              </div>
            </section>

            <section className="dash-section">
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

                <button className="dash-tile" onClick={() => navigate("/lawyer/apprenticeship")}>
                  <div className="dash-tile-title">Apprenticeship</div>
                  <div className="dash-tile-sub">Assign tasks & review notes</div>
                </button>

                <button className="dash-tile" onClick={() => navigate("/lawyer/public-profile")}>
                  <div className="dash-tile-title">Public Profile</div>
                  <div className="dash-tile-sub">Preview what clients see</div>
                </button>
              </div>
            </section>

          </div>

          {/* RIGHT */}
          <div className="dash-right dash-col-side">
            {/* Profile Card */}
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
                  <div className="dash-profile-name">{profile.name || "Lawyer"}</div>
                  <div className="dash-profile-line">{profile.email || "No email set"}</div>
                  <div className="dash-profile-line">{profile.phone || "No phone set"}</div>
                </div>
              </div>

              <div className="dash-profile-hint">Profile completion: <b>{profileCompletion}%</b></div>

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
                <button className="dash-action-btn" onClick={() => navigate("/lawyer/profile/edit")}>
                  Upload Photo
                </button>
              </div>

              <div className="dash-profile-hint">
                Tip: A complete profile improves trust and conversion.
              </div>
            </div>

            {/* KYC */}
            <div className="dash-mini tidy">
              <div className="dash-section-title">KYC Verification</div>
              <div className="dash-mini-card tidy">
                <div className="dash-mini-title">KYC Status</div>
                <div className="dash-mini-sub">
                  {kpisLoading ? "Checking verification status." : "Keep KYC updated for trust with clients."}
                </div>
                <div className="dash-profile-status">
                  <span className="dash-profile-label">Status</span>
                  <span className={`lc-chip ${kycLabel.cls}`}>{kycLabel.text}</span>
                </div>
                {(kpis.kycStatus || "").toLowerCase() !== "approved" && (
                  <div className="dash-kyc-callout">
                    Complete KYC to unlock full visibility in case feed matches.
                  </div>
                )}
                <button className="dash-action-btn primary" onClick={() => navigate("/lawyer/kyc")}>
                  Go to KYC
                </button>
              </div>
            </div>

            {/* Shortcuts */}
            <div className="dash-mini tidy">
              <div className="dash-section-title">Shortcuts</div>
              <div className="dash-mini-card tidy">
                <div className="dash-mini-title">Account Settings</div>
                <div className="dash-mini-sub">Password & preferences.</div>
                <button className="dash-action-btn" onClick={() => navigate("/lawyer/settings")}>
                  Open Settings
                </button>
              </div>
            </div>

            {/* Apprenticeship */}
            <div className="dash-mini tidy">
              <div className="dash-section-title">Apprenticeship</div>
              <div className="dash-mini-card tidy overflow-hidden">
                <div className="dash-mini-title">Apprenticeship Workspace</div>
                <div className="dash-apprentice-grid grid grid-cols-2 gap-4 min-w-0">
                  <div className="min-w-0">
                    <div className="dash-apprentice-label break-words whitespace-normal leading-tight">
                      Active apprentices
                    </div>
                    <div className="dash-apprentice-value">0</div>
                  </div>
                  <div className="min-w-0">
                    <div className="dash-apprentice-label break-words whitespace-normal leading-tight">
                      Pending reviews
                    </div>
                    <div className="dash-apprentice-value">0</div>
                  </div>
                </div>
                <div className="dash-apprentice-actions">
                  <button
                    className="dash-action-btn"
                    onClick={() => navigate("/lawyer/apprenticeship")}
                  >
                    Manage Apprentices
                  </button>
                  <button
                    className="dash-action-btn"
                    onClick={() => navigate("/lawyer/apprenticeship/notes")}
                  >
                    Review Submissions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
