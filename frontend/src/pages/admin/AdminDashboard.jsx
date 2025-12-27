import "./AdminDashboard.css";

const AdminDashboard = () => {
  const metrics = {
    totalUsers: 104,
    totalLawyers: 4,
    verifiedLawyers: 3,
    pendingKYC: 1,
    totalBookings: 1,
    activeBookings: 1,
  };

  const recentBookings = [
    {
      id: 1,
      lawyerName: "Priya Jayawardena",
      date: "12/5/2025",
      time: "10:00",
      status: "confirmed",
    },
  ];

  const lawyers = [
    {
      id: 1,
      name: "Priya Jayawardena",
      specialization: "Corporate Law",
      verified: true,
      image: "👩‍💼",
    },
    {
      id: 2,
      name: "Rohan Perera",
      specialization: "Criminal Law",
      verified: true,
      image: "👨‍💼",
    },
    {
      id: 3,
      name: "Nimalka Fernando",
      specialization: "Property Law",
      verified: true,
      image: "👩‍💼",
    },
    {
      id: 4,
      name: "Arjun Silva",
      specialization: "Immigration Law",
      verified: false,
      image: "👨‍💼",
    },
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="diamond-pattern"></div>

      <main className="admin-dashboard-main">
        <div className="admin-dashboard-container">
          {/* System Overview Section */}
          <section className="admin-overview-section">
            <div className="admin-overview-card">
              <h1 className="admin-overview-title">ADMIN CONSOLE</h1>
              <h2 className="admin-overview-subtitle">System Overview</h2>
              <p className="admin-overview-description">
                Monitor platform activity, manage verifications, and oversee operations.
              </p>
            </div>
          </section>

          {/* Key Metrics Cards */}
          <section className="admin-metrics-grid">
            <div className="admin-metric-card">
              <div className="metric-icon">👥</div>
              <div className="metric-content">
                <div className="metric-value">{metrics.totalUsers}</div>
                <div className="metric-label">Total Users</div>
                <div className="metric-detail">{metrics.totalLawyers} lawyers</div>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="metric-icon">⚖️</div>
              <div className="metric-content">
                <div className="metric-value">{metrics.totalLawyers}</div>
                <div className="metric-label">Total Lawyers</div>
                <div className="metric-detail verified">
                  {metrics.verifiedLawyers} verified
                </div>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="metric-icon">🕒</div>
              <div className="metric-content">
                <div className="metric-value">{metrics.pendingKYC}</div>
                <div className="metric-label">Pending KYC</div>
                <div className="metric-detail gold-link">Review now →</div>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="metric-icon">📅</div>
              <div className="metric-content">
                <div className="metric-value">{metrics.totalBookings}</div>
                <div className="metric-label">Total Bookings</div>
                <div className="metric-detail verified">{metrics.activeBookings} active</div>
              </div>
            </div>
          </section>

          {/* Pending KYC Banner */}
          <section className="admin-kyc-banner">
            <div className="kyc-banner-icon">🕒</div>
            <div className="kyc-banner-content">
              <h3 className="kyc-banner-title">
                {metrics.pendingKYC} Pending KYC Verification
              </h3>
              <p className="kyc-banner-description">
                Review and approve lawyer registrations to maintain platform quality.
              </p>
            </div>
            <a href="/admin/kyc-approval" className="btn btn-primary kyc-review-btn">
              Review KYC →
            </a>
          </section>

          {/* Main Content Grid */}
          <section className="admin-content-grid">
            {/* Recent Bookings Card */}
            <div className="admin-content-card">
              <div className="content-card-header">
                <span className="content-card-icon">⭐</span>
                <h3 className="content-card-title">Recent Bookings</h3>
              </div>
              <div className="content-card-body">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-info">
                      <span className="booking-lawyer">{booking.lawyerName}</span>
                      <span className="booking-date">
                        {booking.date} at {booking.time}
                      </span>
                    </div>
                    <span className={`booking-status ${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lawyers Overview Card */}
            <div className="admin-content-card">
              <div className="content-card-header">
                <span className="content-card-icon">⭐</span>
                <h3 className="content-card-title">Lawyers Overview</h3>
              </div>
              <div className="content-card-body">
                {lawyers.map((lawyer) => (
                  <div key={lawyer.id} className="lawyer-item">
                    <div className="lawyer-avatar-small">{lawyer.image}</div>
                    <div className="lawyer-info-small">
                      <span className="lawyer-name-small">{lawyer.name}</span>
                      <span className="lawyer-spec-small">{lawyer.specialization}</span>
                    </div>
                    {lawyer.verified ? (
                      <span className="lawyer-status-icon verified-icon">✓</span>
                    ) : (
                      <span className="lawyer-status-icon pending-icon">🕒</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Row Cards */}
          <section className="admin-bottom-cards">
            <a href="/admin/kyc-approval" className="admin-feature-card">
              <div className="feature-card-icon">🕒</div>
              <h4 className="feature-card-title">KYC Approval</h4>
              <p className="feature-card-description">
                Review and approve lawyer verifications.
              </p>
            </a>

            <a href="/admin/audit-log" className="admin-feature-card">
              <div className="feature-card-icon">📄</div>
              <h4 className="feature-card-title">Audit Log</h4>
              <p className="feature-card-description">
                View system activity and changes.
              </p>
            </a>

            <div className="admin-feature-card">
              <div className="feature-card-icon">👥</div>
              <h4 className="feature-card-title">Platform Stats</h4>
              <ul className="feature-card-list">
                <li>{metrics.totalLawyers} registered lawyers</li>
                <li>{metrics.totalBookings} total bookings</li>
                <li>{metrics.verifiedLawyers} verified lawyers</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
