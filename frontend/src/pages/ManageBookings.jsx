import { useEffect, useState } from "react";
import api from "../services/api";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const fetchBookings = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/my");
      setBookings(data || []);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load bookings.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (id) => {
    setError("");
    setActionId(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to cancel booking.";
      setError(message);
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString();
  };

  const formatTime = (t) => {
    if (!t) return "-";
    // If backend returns "HH:MM:SS" or "HH:MM"
    return t.length >= 5 ? t.slice(0, 5) : t;
  };

  return (
    <div className="manage-page">
      <div className="top-bar">
        <div className="logo">LexiConnect</div>
        <div className="nav">
          <span>Dashboard</span>
          <span>Search Lawyers</span>
          <span className="active">My Bookings</span>
        </div>
      </div>

      <div className="content">
        <h2>My Bookings</h2>

        {error && <div className="alert error">{error}</div>}
        {loading ? (
          <div className="loading">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="empty">No bookings yet.</div>
        ) : (
          <div className="booking-list">
            {bookings.map((b) => (
              <div key={b.id} className="booking-card">
                <div className="booking-row header">
                  <div className="title">{b.lawyer_name || "Lawyer"}</div>
                  <span
                    className={`status ${
                      b.status === "CANCELLED"
                        ? "cancelled"
                        : b.status === "CONFIRMED"
                        ? "confirmed"
                        : "pending"
                    }`}
                  >
                    {b.status || "PENDING"}
                  </span>
                </div>

                <div className="booking-row meta">
                  <div className="meta-item">
                    <span className="icon">📅</span>
                    {formatDate(b.date)}
                  </div>
                  <div className="meta-item">
                    <span className="icon">⏰</span>
                    {formatTime(b.time)}
                  </div>
                  <div className="meta-item">
                    <span className="icon">📍</span>
                    {b.branch_name || "Branch TBD"}
                  </div>
                </div>

                <div className="booking-row reason">
                  <div className="label">Reason:</div>
                  <div className="text">{b.reason || "N/A"}</div>
                </div>

                <div className="booking-row actions">
                  <button
                    className="btn cancel"
                    onClick={() => handleCancel(b.id)}
                    disabled={actionId === b.id || b.status === "CANCELLED"}
                  >
                    {actionId === b.id ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        :root { color-scheme: dark; }
        .manage-page {
          min-height: 100vh;
          background: radial-gradient(circle at 20% 20%, rgba(255, 215, 128, 0.05), transparent 25%),
            radial-gradient(circle at 80% 30%, rgba(255, 215, 128, 0.05), transparent 25%),
            radial-gradient(circle at 50% 80%, rgba(255, 215, 128, 0.05), transparent 25%),
            #0f172a;
          color: #e5e7eb;
          padding-bottom: 40px;
        }
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 26px;
          background: rgba(10, 14, 26, 0.75);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          position: sticky;
          top: 0;
          backdrop-filter: blur(8px);
          z-index: 5;
        }
        .logo {
          font-weight: 700;
          color: #f7d560;
        }
        .nav {
          display: flex;
          gap: 18px;
          font-size: 14px;
          color: #cbd5e1;
        }
        .nav .active { color: #f5c147; font-weight: 700; }
        .content {
          max-width: 1080px;
          margin: 0 auto;
          padding: 28px 18px;
        }
        h2 {
          margin: 0 0 18px 4px;
          color: #f9fafb;
        }
        .booking-list { display: flex; flex-direction: column; gap: 18px; }
        .booking-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 16px 18px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
        }
        .booking-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .booking-row.header .title { font-size: 18px; font-weight: 700; color: #111827; }
        .booking-row.header {
          background: rgba(255, 255, 255, 0.85);
          padding: 10px 12px;
          border-radius: 12px;
        }
        .status {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status.confirmed { background: rgba(34, 197, 94, 0.18); color: #16a34a; }
        .status.pending { background: rgba(245, 193, 71, 0.2); color: #d97706; }
        .status.cancelled { background: rgba(248, 113, 113, 0.18); color: #ef4444; }
        .booking-row.meta {
          margin-top: 12px;
          flex-wrap: wrap;
          color: #e5e7eb;
        }
        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .icon { font-size: 14px; }
        .booking-row.reason {
          align-items: flex-start;
          margin-top: 12px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .label { font-weight: 700; color: #e5e7eb; width: 70px; }
        .text { color: #cbd5e1; flex: 1; }
        .booking-row.actions {
          justify-content: flex-end;
          margin-top: 14px;
          gap: 10px;
        }
        .btn {
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }
        .btn.cancel {
          background: #ef4444;
          color: #fff;
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.25);
        }
        .btn.cancel:hover { transform: translateY(-1px); }
        .btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
        .alert {
          padding: 12px 14px;
          border-radius: 10px;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .alert.error { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.4); color: #fecdd3; }
        .loading, .empty { color: #cbd5e1; padding: 12px 4px; }
      `}</style>
    </div>
  );
};

export default ManageBookings;

