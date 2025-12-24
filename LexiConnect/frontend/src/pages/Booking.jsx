import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const Booking = () => {
  const { lawyerId } = useParams();
  const [form, setForm] = useState({
    date: "",
    time: "",
    reason: "",
    branch_id: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/bookings", {
        lawyer_id: Number(lawyerId),
        branch_id: form.branch_id ? Number(form.branch_id) : null,
        date: form.date,
        time: form.time,
        reason: form.reason,
      });
      setSuccess("Booking created successfully.");
      setForm({ date: "", time: "", reason: "", branch_id: "" });
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Booking failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-card">
        <div className="logo-block">
          <div className="logo-mark">⚖️</div>
          <div className="logo-text">
            <div className="brand">LexiConnect</div>
            <div className="tagline">Book your consultation</div>
          </div>
        </div>

        <h2 className="title">Schedule a Booking</h2>
        <p className="subtitle">
          Lawyer ID: <span className="highlight">{lawyerId}</span>
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label className="label">
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <label className="label">
            Time
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </label>

          <label className="label">
            Branch (optional)
            <input
              type="number"
              name="branch_id"
              value={form.branch_id}
              onChange={handleChange}
              placeholder="Enter branch ID"
              min="0"
            />
          </label>

          <label className="label">
            Reason
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Briefly describe your case..."
              rows="4"
            />
          </label>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>

      <style>{`
        :root { color-scheme: dark; }
        .booking-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: radial-gradient(circle at 20% 20%, rgba(255, 215, 128, 0.05), transparent 25%),
            radial-gradient(circle at 80% 30%, rgba(255, 215, 128, 0.05), transparent 25%),
            radial-gradient(circle at 50% 80%, rgba(255, 215, 128, 0.05), transparent 25%),
            #0f172a;
        }
        .booking-card {
          width: min(520px, 90vw);
          background: linear-gradient(135deg, rgba(31, 41, 63, 0.95), rgba(20, 26, 40, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
          border-radius: 18px;
          padding: 36px 36px 30px;
          backdrop-filter: blur(8px);
          color: #e5e7eb;
        }
        .logo-block {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          margin-bottom: 12px;
        }
        .logo-mark { font-size: 28px; }
        .logo-text .brand { font-size: 20px; font-weight: 700; color: #f7d560; }
        .logo-text .tagline { font-size: 12px; color: #9ca3af; }
        .title {
          text-align: center;
          margin: 8px 0 4px;
          font-size: 22px;
          font-weight: 700;
          color: #f9fafb;
        }
        .subtitle {
          text-align: center;
          color: #cbd5e1;
          margin-bottom: 18px;
          font-size: 14px;
        }
        .highlight { color: #f5c147; font-weight: 700; }
        .form { display: flex; flex-direction: column; gap: 14px; }
        .label { display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: #cbd5e1; }
        input, textarea {
          background: #0b1220;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 12px 14px;
          color: #f8fafc;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        textarea { resize: vertical; min-height: 100px; }
        input:focus, textarea:focus {
          outline: none;
          border-color: #f5c147;
          box-shadow: 0 0 0 3px rgba(245, 193, 71, 0.2);
        }
        button {
          margin-top: 4px;
          padding: 12px 14px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(90deg, #f5c147, #f1a93c);
          color: #1f2937;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }
        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(245, 193, 71, 0.25);
        }
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fecdd3;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
        }
        .success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.35);
          color: #bbf7d0;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

export default Booking;

