import { useState, useEffect } from "react";
import {
  createBooking,
  listMyBookings,
  getBookingById,
  cancelBooking,
} from "../services/bookings";

/**
 * Example component demonstrating how to use the booking service
 * This is a reference implementation - copy and adapt as needed
 */
const BookingServiceExample = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state for creating a booking
  const [bookingForm, setBookingForm] = useState({
    lawyer_id: "",
    branch_id: "",
    scheduled_at: "",
    note: "",
  });

  // Load bookings on component mount
  useEffect(() => {
    loadBookings();
  }, []);

  // Example 1: List all bookings for current user
  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listMyBookings();
      setBookings(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Create a new booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        lawyer_id: Number(bookingForm.lawyer_id),
        branch_id: bookingForm.branch_id ? Number(bookingForm.branch_id) : null,
        scheduled_at: bookingForm.scheduled_at || null,
        note: bookingForm.note || null,
      };

      const newBooking = await createBooking(payload);
      setSuccess("Booking created successfully!");
      setBookingForm({ lawyer_id: "", branch_id: "", scheduled_at: "", note: "" });
      // Reload bookings list
      await loadBookings();
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to create booking"
      );
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Get a specific booking by ID
  const handleGetBooking = async (bookingId) => {
    setLoading(true);
    setError("");
    try {
      const booking = await getBookingById(bookingId);
      setSelectedBooking(booking);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load booking"
      );
      setSelectedBooking(null);
    } finally {
      setLoading(false);
    }
  };

  // Example 4: Cancel a booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await cancelBooking(bookingId);
      setSuccess("Booking cancelled successfully!");
      // Reload bookings list
      await loadBookings();
      // Clear selected booking if it was the cancelled one
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to cancel booking"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Booking Service Example</h1>

      {/* Error/Success Messages */}
      {error && (
        <div style={{ padding: "1rem", background: "#fee", color: "#c33", marginBottom: "1rem", borderRadius: "4px" }}>
          Error: {error}
        </div>
      )}
      {success && (
        <div style={{ padding: "1rem", background: "#efe", color: "#3c3", marginBottom: "1rem", borderRadius: "4px" }}>
          {success}
        </div>
      )}

      {/* Create Booking Form */}
      <section style={{ marginBottom: "2rem", padding: "1.5rem", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2>Create Booking</h2>
        <form onSubmit={handleCreateBooking}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Lawyer ID:{" "}
              <input
                type="number"
                value={bookingForm.lawyer_id}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, lawyer_id: e.target.value })
                }
                required
                style={{ padding: "0.5rem", marginLeft: "0.5rem" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Branch ID (optional):{" "}
              <input
                type="number"
                value={bookingForm.branch_id}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, branch_id: e.target.value })
                }
                style={{ padding: "0.5rem", marginLeft: "0.5rem" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Scheduled At (ISO datetime, optional):{" "}
              <input
                type="datetime-local"
                value={bookingForm.scheduled_at}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, scheduled_at: e.target.value })
                }
                style={{ padding: "0.5rem", marginLeft: "0.5rem" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Note (optional):{" "}
              <textarea
                value={bookingForm.note}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, note: e.target.value })
                }
                style={{ padding: "0.5rem", marginLeft: "0.5rem", width: "100%", minHeight: "80px" }}
              />
            </label>
          </div>
          <button type="submit" disabled={loading} style={{ padding: "0.75rem 1.5rem", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating..." : "Create Booking"}
          </button>
        </form>
      </section>

      {/* Bookings List */}
      <section style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2>My Bookings</h2>
          <button onClick={loadBookings} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
            Refresh
          </button>
        </div>

        {loading && bookings.length === 0 ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>Booking #{booking.id}</strong>
                  <p>Lawyer ID: {booking.lawyer_id}</p>
                  <p>Status: {booking.status}</p>
                  {booking.scheduled_at && (
                    <p>Scheduled: {new Date(booking.scheduled_at).toLocaleString()}</p>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleGetBooking(booking.id)}
                    disabled={loading}
                    style={{ padding: "0.5rem 1rem" }}
                  >
                    View Details
                  </button>
                  {booking.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={loading}
                      style={{ padding: "0.5rem 1rem", background: "#fcc", border: "1px solid #f99" }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Selected Booking Details */}
      {selectedBooking && (
        <section style={{ padding: "1.5rem", border: "1px solid #ddd", borderRadius: "8px", background: "#f9f9f9" }}>
          <h2>Booking Details</h2>
          <pre style={{ background: "#fff", padding: "1rem", borderRadius: "4px", overflow: "auto" }}>
            {JSON.stringify(selectedBooking, null, 2)}
          </pre>
          <button onClick={() => setSelectedBooking(null)} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
            Close
          </button>
        </section>
      )}
    </div>
  );
};

export default BookingServiceExample;



