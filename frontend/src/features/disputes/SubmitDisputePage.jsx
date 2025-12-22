import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDispute } from "../../services/disputes";

export default function SubmitDisputePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bookingId, setBookingId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
    };

    // booking_id optional
    if (bookingId.trim()) {
      const parsedId = Number(bookingId);
      if (isNaN(parsedId) || parsedId <= 0) {
        setError("Booking ID must be a positive number.");
        return;
      }
      payload.booking_id = parsedId;
    }

    try {
      setLoading(true);
      const created = await createDispute(payload);
      setSuccess(`Dispute submitted successfully! (ID: ${created.id})`);
      setTitle("");
      setDescription("");
      setBookingId("");
      
      // Optionally navigate to the dispute detail page after a short delay
      setTimeout(() => {
        navigate(`/disputes/${created.id}`);
      }, 1500);
    } catch (e) {
      const message =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to submit dispute.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-amber-400 hover:text-amber-300 mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold mb-2">Submit Dispute</h1>
          <p className="text-gray-400">
            Report an issue or complaint. Our team will review and respond.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-green-200">
            {success}
          </div>
        )}

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title for your dispute"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the issue..."
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Booking ID <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="number"
                min="1"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g. 12"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                If this dispute is related to a specific booking, enter the booking ID.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Submitting..." : "Submit Dispute"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
