import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  downloadWeeklyReport,
  downloadKycSummary,
  downloadBookingSummary,
  downloadAuditTrail,
} from "../../features/admin/services/adminReports.service";
import { downloadFromResponse } from "../../features/admin/utils/downloadFile";
import AuthLoginsPerMinuteLineChart from "../../features/admin/components/charts/AuthLoginsPerMinuteLineChart";
import AuditTopActionsBarChart from "../../features/admin/components/charts/AuditTopActionsBarChart";
import SystemActivityDistributionPieChart from "../../features/admin/components/charts/SystemActivityDistributionPieChart";
import BookingOutcomeDistributionPieChart from "../../features/admin/components/charts/BookingOutcomeDistributionPieChart";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lawyerPage, setLawyerPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [reportError, setReportError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/admin/overview");
      setData(res.data);
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load admin overview.";
      setError(msg);
      if (status === 401 || status === 403) {
        navigate("/not-authorized");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = useMemo(() => {
    if (!data) {
      return {
        totalUsers: "—",
        totalLawyers: "—",
        verifiedLawyers: "—",
        pendingKYC: "—",
        totalBookings: "—",
      };
    }
    return {
      totalUsers: data.total_users,
      totalLawyers: data.total_lawyers,
      verifiedLawyers: data.verified_lawyers,
      pendingKYC: data.pending_kyc,
      totalBookings: data.total_bookings,
    };
  }, [data]);

  const recentBookings = data?.recent_bookings || [];
  const lawyers = data?.lawyers || [];
  const bookingsPerPage = 5;
  const bookingsPageCount = Math.max(1, Math.ceil(recentBookings.length / bookingsPerPage));
  const pagedBookings = useMemo(() => {
    const start = (bookingPage - 1) * bookingsPerPage;
    return recentBookings.slice(start, start + bookingsPerPage);
  }, [recentBookings, bookingPage]);
  const lawyersPerPage = 6;
  const lawyersPageCount = Math.max(1, Math.ceil(lawyers.length / lawyersPerPage));
  const pagedLawyers = useMemo(() => {
    const start = (lawyerPage - 1) * lawyersPerPage;
    return lawyers.slice(start, start + lawyersPerPage);
  }, [lawyers, lawyerPage]);

  useEffect(() => {
    if (lawyerPage > lawyersPageCount) {
      setLawyerPage(lawyersPageCount);
    }
  }, [lawyerPage, lawyersPageCount]);

  useEffect(() => {
    if (bookingPage > bookingsPageCount) {
      setBookingPage(bookingsPageCount);
    }
  }, [bookingPage, bookingsPageCount]);

  const handleReportError = (err) => {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to generate report.";
    setReportError(msg);
  };

  const exportWeeklySystemCSV = async () => {
    setExporting(true);
    setReportError("");
    try {
      const resp = await downloadWeeklyReport(7);
      downloadFromResponse(resp, "system_activity_7d.csv");
    } catch (err) {
      handleReportError(err);
    } finally {
      setExporting(false);
    }
  };

  const exportKycStatusCSV = async () => {
    setExporting(true);
    setReportError("");
    try {
      const resp = await downloadKycSummary();
      downloadFromResponse(resp, "kyc_status.csv");
    } catch (err) {
      handleReportError(err);
    } finally {
      setExporting(false);
    }
  };

  const exportBookingSummaryCSV = async () => {
    setExporting(true);
    setReportError("");
    try {
      const resp = await downloadBookingSummary(30);
      downloadFromResponse(resp, "booking_summary_30d.csv");
    } catch (err) {
      handleReportError(err);
    } finally {
      setExporting(false);
    }
  };

  const exportAuditTrailJSON = async () => {
    setExporting(true);
    setReportError("");
    try {
      const resp = await downloadAuditTrail(30, 1, 500);
      downloadFromResponse(resp, "audit_trail_30d.json");
    } catch (err) {
      handleReportError(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="admin-dashboard-page">
      <div className="diamond-pattern"></div>

      <main className="admin-dashboard-main">
        <div className="admin-dashboard-container">
          <section className="admin-overview-section">
            <div className="admin-overview-card">
              <h1 className="admin-overview-title">Admin Dashboard</h1>
              <h2 className="admin-overview-subtitle">Operations Console</h2>
            </div>
          </section>

          {error && (
            <div className="admin-error-banner">
              {error}
            </div>
          )}

          <section className="admin-metrics-grid">
            {[
              {
                icon: "👥",
                value: metrics.totalUsers,
                label: "Total Users",
                detail: `${metrics.totalLawyers} lawyers`,
              },
              {
                icon: "⚖️",
                value: metrics.totalLawyers,
                label: "Total Lawyers",
                detail: `${metrics.verifiedLawyers} verified`,
              },
              {
                icon: "⏳",
                value: metrics.pendingKYC,
                label: "Pending KYC",
                detail: "Awaiting review",
              },
              {
                icon: "📅",
                value: metrics.totalBookings,
                label: "Total Bookings",
                detail: "",
              },
            ].map((card, idx) => (
              <div key={idx} className="admin-metric-card">
                <div className="metric-icon">{card.icon}</div>
                <div className="metric-content">
                  <div className="metric-value">
                    {loading ? "…" : card.value}
                  </div>
                  <div className="metric-label">{card.label}</div>
                  <div className="metric-detail">{card.detail}</div>
                </div>
              </div>
            ))}
          </section>

          <section className="admin-charts-grid">
            <AuthLoginsPerMinuteLineChart />
            <SystemActivityDistributionPieChart />
            <AuditTopActionsBarChart />
            <BookingOutcomeDistributionPieChart />
          </section>

          <section className="admin-kyc-banner">
            <div className="kyc-banner-icon">⏳</div>
            <div className="kyc-banner-content">
              <h3 className="kyc-banner-title">
                {loading ? "…" : metrics.pendingKYC} Pending KYC Verification
              </h3>
              <p className="kyc-banner-description">Action required this week.</p>
            </div>
            <a href="/admin/kyc-approval" className="btn btn-primary kyc-review-btn">
              Review KYC →
            </a>
          </section>

          <section className="admin-content-grid">
            <div className="admin-content-card admin-content-card--fixed">
              <div className="content-card-header">
                <span className="content-card-icon">⭐</span>
                <h3 className="content-card-title">Recent Bookings</h3>
              </div>
              <div className="content-card-body fixed-list">
                {loading && <div className="booking-item skeleton">Loading...</div>}
                {!loading && recentBookings.length === 0 && (
                  <div className="no-kyc-data">No recent bookings.</div>
                )}
                {!loading &&
                  pagedBookings.map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      className="booking-item booking-item-clickable"
                      onClick={() => navigate(`/lawyer/bookings/${booking.id}`)}
                    >
                      <div className="booking-info">
                        <span className="booking-lawyer">
                          {booking.client_name || "Client"}
                        </span>
                        <span className="booking-date">
                          {booking.scheduled_at
                            ? new Date(booking.scheduled_at).toLocaleString()
                            : "Unscheduled"}
                        </span>
                      </div>
                      <span className={`booking-status ${booking.status || "pending"}`}>
                        {booking.status}
                      </span>
                    </button>
                  ))}
              </div>
              <div className="content-card-footer">
                <button
                  type="button"
                  className="content-card-page-btn"
                  onClick={() => setBookingPage((p) => Math.max(1, p - 1))}
                  disabled={bookingPage <= 1}
                >
                  Prev
                </button>
                <span className="content-card-page-meta">
                  Page {bookingPage} of {bookingsPageCount}
                </span>
                <button
                  type="button"
                  className="content-card-page-btn"
                  onClick={() => setBookingPage((p) => Math.min(bookingsPageCount, p + 1))}
                  disabled={bookingPage >= bookingsPageCount}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="admin-content-card admin-content-card--fixed">
              <div className="content-card-header">
                <div>
                  <span className="content-card-icon">⭐</span>
                  <h3 className="content-card-title">Lawyers Overview</h3>
                </div>
                <button
                  type="button"
                  className="content-card-link"
                  onClick={() => navigate("/client/search")}
                >
                  View all lawyers
                </button>
              </div>
              <div className="content-card-body fixed-list">
                {loading && <div className="lawyer-item skeleton">Loading...</div>}
                {!loading && lawyers.length === 0 && (
                  <div className="no-kyc-data">No lawyers found.</div>
                )}
                {!loading &&
                  pagedLawyers.map((lawyer) => (
                    <div key={lawyer.user_id} className="lawyer-item">
                      <div className="lawyer-avatar-small">
                        {(lawyer.full_name || "L")[0]}
                      </div>
                      <div className="lawyer-info-small">
                        <span className="lawyer-name-small">{lawyer.full_name}</span>
                        <span className="lawyer-spec-small">{lawyer.specialization}</span>
                      </div>
                      {lawyer.is_verified ? (
                        <span className="lawyer-status-icon verified-icon">✓</span>
                      ) : (
                        <span className="lawyer-status-icon pending-icon">⏳</span>
                      )}
                    </div>
                  ))}
              </div>
              <div className="content-card-footer">
                <button
                  type="button"
                  className="content-card-page-btn"
                  onClick={() => setLawyerPage((p) => Math.max(1, p - 1))}
                  disabled={lawyerPage <= 1}
                >
                  Prev
                </button>
                <span className="content-card-page-meta">
                  Page {lawyerPage} of {lawyersPageCount}
                </span>
                <button
                  type="button"
                  className="content-card-page-btn"
                  onClick={() => setLawyerPage((p) => Math.min(lawyersPageCount, p + 1))}
                  disabled={lawyerPage >= lawyersPageCount}
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          <section className="admin-reports-section">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Reports</h3>
            </div>
            {reportError && (
              <div style={{ color: "rgba(248, 113, 113, 0.95)", fontSize: "0.85rem" }}>
                {reportError}
              </div>
            )}
            <div className="admin-reports-grid">
              <div className="admin-report-card">
                <div className="report-card-icon">📊</div>
                <div className="report-card-body">
                  <div className="report-card-title">Weekly System Activity Report</div>
                  <div className="report-card-subtitle">
                    Summary of auth, audit, and booking events.
                  </div>
                </div>
                <button
                  className="btn btn-secondary report-card-action"
                  onClick={exportWeeklySystemCSV}
                  disabled={exporting}
                >
                  {exporting ? "Generating..." : "Download CSV"}
                </button>
              </div>

              <div className="admin-report-card">
                <div className="report-card-icon">⏳</div>
                <div className="report-card-body">
                  <div className="report-card-title">KYC Status Summary</div>
                  <div className="report-card-subtitle">Pending vs. verified lawyers.</div>
                </div>
                <button
                  className="btn btn-secondary report-card-action"
                  onClick={exportKycStatusCSV}
                  disabled={exporting}
                >
                  {exporting ? "Generating..." : "Download CSV"}
                </button>
              </div>

              <div className="admin-report-card">
                <div className="report-card-icon">📅</div>
                <div className="report-card-body">
                  <div className="report-card-title">Booking Summary (30 days)</div>
                  <div className="report-card-subtitle">
                    Outcomes and volume overview.
                  </div>
                </div>
                <button
                  className="btn btn-secondary report-card-action"
                  onClick={exportBookingSummaryCSV}
                  disabled={exporting}
                >
                  {exporting ? "Generating..." : "Download CSV"}
                </button>
              </div>

              <div className="admin-report-card">
                <div className="report-card-icon">🧾</div>
                <div className="report-card-body">
                  <div className="report-card-title">Audit Trail Export</div>
                  <div className="report-card-subtitle">
                    Full change log for compliance review.
                  </div>
                </div>
                <button
                  className="btn btn-secondary report-card-action"
                  onClick={exportAuditTrailJSON}
                  disabled={exporting}
                >
                  {exporting ? "Generating..." : "Export JSON"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
