import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyDisputes } from "../../services/disputes";

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  const getStatusClass = () => {
    switch (s) {
      case "PENDING":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-500/50";
      case "RESOLVED":
        return "bg-green-900/30 text-green-400 border-green-500/50";
      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusClass()}`}
    >
      {s}
    </span>
  );
}

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "N/A";
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  } catch {
    return dateTimeStr;
  }
};

export default function ClientMyDisputesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDisputes = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await listMyDisputes();
      setItems(data || []);
    } catch (e) {
      const message =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to load disputes.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-gray-400">Loading disputes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Disputes</h1>
          <p className="text-gray-400">
            View and manage all your submitted disputes.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No disputes found.</p>
            <button
              onClick={() => navigate("/disputes/submit")}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
            >
              Submit a Dispute
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-4">
            {items.map((dispute) => (
              <button
                key={dispute.id}
                onClick={() => navigate(`/disputes/${dispute.id}`)}
                className="w-full text-left bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-750 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {dispute.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {dispute.description}
                    </p>
                  </div>
                  <div className="ml-4">
                    <StatusBadge status={dispute.status} />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-slate-700">
                  <span>ID: {dispute.id}</span>
                  {dispute.booking_id && (
                    <span>• Booking: {dispute.booking_id}</span>
                  )}
                  <span>• Created: {formatDateTime(dispute.created_at)}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => navigate("/disputes/submit")}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
            >
              + Submit New Dispute
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
