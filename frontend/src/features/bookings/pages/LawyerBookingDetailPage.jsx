import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../../../components/ui/PageShell";
import StatusPill from "../../../components/ui/StatusPill";
import EmptyState from "../../../components/ui/EmptyState";
import { getBookingById } from "../../../services/bookings";

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function LawyerBookingDetailPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Could not load booking.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookingId]);

  const statusClass = useMemo(() => booking?.status, [booking]);

  if (loading) {
    return (
      <PageShell title="Booking Details" subtitle="Loading booking...">
        <div className="text-slate-300">Loading...</div>
      </PageShell>
    );
  }

  if (error || !booking) {
    return (
      <PageShell title="Booking Details">
        <EmptyState
          title="Could not load booking"
          description={error || "Booking not found."}
          buttonLabel="Back to incoming"
          buttonLink="/lawyer/bookings/incoming"
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Booking #${booking.id}`}
      subtitle="Review request details"
      maxWidth="max-w-4xl"
      contentClassName="space-y-6"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-400">Status</div>
            <div className="mt-1">
              <StatusPill status={statusClass} />
            </div>
          </div>
          <div className="text-right text-sm text-slate-400">
            Created: <span className="text-white">{formatDateTime(booking.created_at)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-slate-400 text-xs uppercase tracking-wide">Scheduled</div>
            <div className="text-white font-medium">{formatDateTime(booking.scheduled_at)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 text-xs uppercase tracking-wide">Client ID</div>
            <div className="text-white font-medium">{booking.client_id ?? "—"}</div>
          </div>
        </div>

        {booking.note && (
          <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Client Note</div>
            <div className="text-white text-sm whitespace-pre-wrap">{booking.note}</div>
          </div>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Documents</div>
            <div className="text-sm text-slate-400">View uploaded documents (read-only).</div>
          </div>
          <Link
            to={`/lawyer/bookings/${booking.id}/documents`}
            className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium text-white transition-colors"
          >
            Open Documents
          </Link>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Intake</div>
            <div className="text-sm text-slate-400">Review intake details (view only).</div>
          </div>
          <Link
            to={`/lawyer/bookings/${booking.id}/intake`}
            className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-sm font-medium text-white transition-colors"
          >
            View Intake
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
