import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CaseIntakeSection from "../../modules/case_files/components/CaseIntakeSection";

import {
  lawyerListIncomingBookings,
  lawyerConfirmBooking,
  lawyerRejectBooking,
} from "../../services/bookings";

const LawyerIncomingBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const fetchBookings = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await lawyerListIncomingBookings();
      setBookings(data || []);
    } catch (err) {
      // Handle 404 specifically with friendly message
      if (err?.response?.status === 404) {
        setError("Incoming bookings endpoint not available.");
      } else {
        // Show actual API errors for other cases
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load incoming bookings.";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = async (id) => {
    if (!window.confirm("Are you sure you want to confirm this booking request?")) {
      return;
    }

    setError("");
    setActionId(id);
    try {
      await lawyerConfirmBooking(id);
      // Refresh bookings list
      await fetchBookings();
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to confirm booking.";
      setError(message);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this booking request?")) {
      return;
    }

    setError("");
    setActionId(id);
    try {
      await lawyerRejectBooking(id);
      // Refresh bookings list
      await fetchBookings();
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to reject booking.";
      setError(message);
    } finally {
      setActionId(null);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "Not scheduled";
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString();
    } catch {
      return dateTimeStr;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-500/50";
      case "CONFIRMED":
        return "bg-green-900/30 text-green-400 border-green-500/50";
      case "REJECTED":
        return "bg-red-900/30 text-red-400 border-red-500/50";
      case "CANCELLED":
        return "bg-gray-900/30 text-gray-400 border-gray-500/50";
      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* ✅ TEMP DEMO BLOCK: Case Files (Case Intake) */}
        <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Case Files (Demo)</h2>
          <CaseIntakeSection />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Incoming Booking Requests</h1>
          <p className="text-gray-400">
            Review and respond to pending booking requests from clients.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading incoming bookings...</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 text-lg mb-2">No pending booking requests.</p>
            <p className="text-gray-500 text-sm">
              New booking requests from clients will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-semibold">Booking #{booking.id}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusBadgeClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Client ID: </span>
                        <span className="text-white font-medium">{booking.client_id}</span>
                      </div>
                      {booking.branch_id && (
                        <div>
                          <span className="text-gray-400">Branch ID: </span>
                          <span className="text-white font-medium">{booking.branch_id}</span>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <span className="text-gray-400">Scheduled: </span>
                        <span className="text-white">{formatDateTime(booking.scheduled_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {booking.note && (
                  <div className="mb-4 p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-300 mb-1">Client Note:</p>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{booking.note}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="text-sm text-gray-400">
                    Requested: {formatDateTime(booking.created_at)}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/lawyer/bookings/${booking.id}`)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleConfirm(booking.id)}
                      disabled={
                        actionId === booking.id || booking.status?.toUpperCase() !== "PENDING"
                      }
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      {actionId === booking.id ? "Confirming..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => handleReject(booking.id)}
                      disabled={
                        actionId === booking.id || booking.status?.toUpperCase() !== "PENDING"
                      }
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      {actionId === booking.id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerIncomingBookingsPage;
