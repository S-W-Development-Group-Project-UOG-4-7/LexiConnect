import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBooking } from "../services/bookings";
import PageShell from "../components/ui/PageShell";

export default function Booking() {
  const { lawyerId } = useParams();
  const navigate = useNavigate();

  const prefilledLawyerId = useMemo(() => {
    const n = Number(lawyerId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [lawyerId]);

  const [lawyerField, setLawyerField] = useState(prefilledLawyerId ? String(prefilledLawyerId) : "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const resolvedLawyerId = prefilledLawyerId || Number(lawyerField);
    if (!resolvedLawyerId || Number.isNaN(resolvedLawyerId)) {
      setError("Please provide a valid lawyer ID.");
      return;
    }

    if (!scheduledAt) {
      setError("Please choose a date and time.");
      return;
    }

    const payload = {
      lawyer_id: resolvedLawyerId,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      note: note.trim() || undefined,
    };

    try {
      setLoading(true);
      await createBooking(payload);
      navigate("/client/manage-bookings");
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
    <PageShell
      title="Book an Appointment"
      subtitle="Select your slot and confirm the booking"
      maxWidth="max-w-3xl"
      contentClassName="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-5"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <div className="text-sm text-slate-400">Lawyer</div>
          <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg p-3">
            <div className="text-white font-semibold">
              {prefilledLawyerId ? `ID #${prefilledLawyerId}` : "Specify lawyer ID"}
            </div>
            {!prefilledLawyerId && (
              <input
                type="number"
                min="1"
                value={lawyerField}
                onChange={(e) => setLawyerField(e.target.value)}
                className="w-32 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. 12"
                required
              />
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-400" htmlFor="scheduled_at">
            Date & time <span className="text-red-400">*</span>
          </label>
          <input
            id="scheduled_at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-400" htmlFor="note">
            Note (optional)
          </label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
            placeholder="Share any context for the lawyer..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </form>
    </PageShell>
  );
}
