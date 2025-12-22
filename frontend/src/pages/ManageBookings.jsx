import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyBookings, cancelBooking } from "../services/bookings";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await listMyBookings();
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
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setError("");
    setActionId(id);
    try {
      await cancelBooking(id);
      // Refresh bookings list
      await fetchBookings();
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

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString();
    } catch {
      return dateTimeStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-gray-400">No bookings yet.</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-semibold">ID: {booking.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      booking.status === "cancelled"
                        ? "bg-red-900/30 text-red-400"
                        : booking.status === "confirmed"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-yellow-900/30 text-yellow-400"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Scheduled: {formatDateTime(booking.scheduled_at)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/client/bookings/${booking.id}/documents/upload`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Documents
                  </button>
                  {booking.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={actionId === booking.id}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      {actionId === booking.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;

