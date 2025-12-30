import { useState } from "react";
import "./AuditLog.css";

const AuditLog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("All Actions");

  const auditEntries = [
    {
      id: 1,
      timestamp: "12/11/2025",
      time: "10:47:47 AM",
      user: "admin@lexiconnect.com",
      action: "KYC_APPROVED",
      description: "Approved KYC for lawyer Priya Jayawardena",
    },
  ];

  const summary = {
    totalEntries: 1,
    today: 1,
    uniqueUsers: 1,
    actionTypes: 1,
  };

  const actionTypes = [
    "All Actions",
    "KYC_APPROVED",
    "KYC_REJECTED",
    "USER_CREATED",
    "BOOKING_CREATED",
  ];

  const handleExport = (format) => {
    console.log(`Exporting as ${format}`);
    // TODO: Implement export logic
  };

  return (
    <div className="audit-log-page">
      <div className="diamond-pattern"></div>

      <main className="audit-log-main">
        <div className="audit-log-container">
          {/* Page Title */}
          <h1 className="audit-page-title">Case Audit Log</h1>

          {/* Search and Filter Section */}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                className="audit-filter-select"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                {actionTypes.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="audit-summary-grid">
            <div className="audit-summary-card">
              <div className="summary-label">Total Entries</div>
              <div className="summary-value">{summary.totalEntries}</div>
            </div>
            <div className="audit-summary-card">
              <div className="summary-label">Today</div>
              <div className="summary-value">{summary.today}</div>
            </div>
            <div className="audit-summary-card">
              <div className="summary-label">Unique Users</div>
              <div className="summary-value">{summary.uniqueUsers}</div>
            </div>
            <div className="audit-summary-card">
              <div className="summary-label">Action Types</div>
              <div className="summary-value">{summary.actionTypes}</div>
            </div>
          </div>

          {/* Audit Log Table */}
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
                {auditEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <div className="audit-timestamp">
                        <span className="timestamp-icon">📅</span>
                        <div className="timestamp-details">
                          <span className="timestamp-date">{entry.timestamp}</span>
                          <span className="timestamp-time">{entry.time}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="audit-user">
                        <span className="user-icon">👤</span>
                        <span>{entry.user}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`audit-action-badge action-${entry.action
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

            {auditEntries.length === 0 && (
              <div className="no-audit-data">
                <p>No audit entries found.</p>
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="audit-export-card">
            <h3 className="export-title">Export Options</h3>
            <div className="export-buttons">
              <button
                className="btn btn-primary export-btn export-csv"
                onClick={() => handleExport("CSV")}
              >
                Export as CSV
              </button>
              <button
                className="btn btn-success export-btn export-pdf"
                onClick={() => handleExport("PDF")}
              >
                Export as PDF
              </button>
              <button
                className="btn btn-secondary export-btn export-json"
                onClick={() => handleExport("JSON")}
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditLog;
