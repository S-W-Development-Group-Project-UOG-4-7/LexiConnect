import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function AvailabilityEditor() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [branchId, setBranchId] = useState("");
  const [maxBookings, setMaxBookings] = useState(1);
  const [branches, setBranches] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Replace with logged-in lawyer id when auth is wired up.
  const lawyerId = 1;

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API_BASE}/branches`, {
        params: { lawyer_id: lawyerId },
      });
      setBranches(res.data || []);
    } catch (err) {
      console.error("Failed to load branches", err);
      setError("Could not load branches");
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE}/availability`, {
        params: { lawyer_id: lawyerId },
      });
      setSlots(res.data || []);
    } catch (err) {
      console.error("Failed to load slots", err);
      setError("Could not load slots");
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchSlots();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!date || !startTime || !endTime || !branchId) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const start = `${date}T${startTime}:00`;
      const end = `${date}T${endTime}:00`;
      await axios.post(`${API_BASE}/availability`, {
        lawyer_id: lawyerId,
        branch_id: Number(branchId),
        start_time: start,
        end_time: end,
        max_bookings: Number(maxBookings) || 1,
      });
      setStartTime("");
      setEndTime("");
      setBranchId("");
      setMaxBookings(1);
      await fetchSlots();
    } catch (err) {
      console.error("Failed to create slot", err);
      setError(err.response?.data?.detail || "Failed to create slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "720px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
        Availability Editor
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}
      >
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label>End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label>Branch</label>
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name || `Branch ${b.id}`}
                </option>
              ))}
            </select>
          </div>
          <div style={{ width: "140px", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label>Max Bookings</label>
            <input
              type="number"
              min="1"
              value={maxBookings}
              onChange={(e) => setMaxBookings(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ padding: "0.5rem 0.75rem" }}>
          {loading ? "Saving..." : "Add Slot"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      <div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
          Existing Slots
        </h3>
        {slots.length === 0 && <p>No slots yet.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {slots.map((s) => (
            <div
              key={s.id}
              style={{
                border: "1px solid #ddd",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {new Date(s.start_time).toLocaleString()} → {new Date(s.end_time).toLocaleString()}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#555" }}>
                  Branch: {s.branch_id} • Max: {s.max_bookings}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

