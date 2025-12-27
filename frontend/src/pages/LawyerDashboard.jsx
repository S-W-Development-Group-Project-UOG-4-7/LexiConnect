import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/ui/PageShell";
import StatGrid from "../components/ui/StatGrid";
import EmptyState from "../components/ui/EmptyState";
import { lawyerListIncomingBookings } from "../services/bookings";
import StatusPill from "../components/ui/StatusPill";

export default function LawyerDashboard() {
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await lawyerListIncomingBookings();
        setIncoming(data || []);
      } catch (err) {
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Could not load incoming bookings.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const incomingCount = typeof incoming?.length === "number" ? incoming.length : "—";
    return [
      { label: "Incoming bookings", value: incomingCount || "—" },
      { label: "Token queue today", value: "—", hint: "Coming soon" },
      { label: "KYC status", value: <StatusPill status="Pending" /> },
    ];
  }, [incoming]);

  return (
    <PageShell
      title="Lawyer Dashboard"
      subtitle="Overview of your practice activity"
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            to="/lawyer/bookings/incoming"
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-sm font-medium text-white transition-colors"
          >
            Incoming
          </Link>
          <Link
            to="/lawyer/availability"
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 hover:bg-slate-700 text-sm font-medium text-white transition-colors"
          >
            Availability
          </Link>
        </div>
      }
      contentClassName="space-y-6"
    >
      <StatGrid items={stats} className="md:grid-cols-3" />

      <section className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Quick Links</div>
            <div className="text-sm text-slate-400">Move faster on daily tasks</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/lawyer/bookings/incoming"
              className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-sm font-medium text-white transition-colors"
            >
              Incoming Bookings
            </Link>
            <Link
              to="/lawyer/availability"
              className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium text-white transition-colors"
            >
              Availability
            </Link>
            <Link
              to="/lawyer/token-queue"
              className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium text-white transition-colors"
            >
              Token Queue
            </Link>
            <Link
              to="/lawyer/kyc"
              className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium text-white transition-colors"
            >
              KYC
            </Link>
            <Link
              to="/lawyer/branches"
              className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium text-white transition-colors"
            >
              Branches
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-800 border border-slate-700 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-semibold text-white">Incoming bookings</div>
            <div className="text-sm text-slate-400">Latest client requests</div>
          </div>
          <Link
            to="/lawyer/bookings/incoming"
            className="text-sm text-amber-300 hover:text-amber-200 underline"
          >
            View all
          </Link>
        </div>

        {loading && <div className="text-slate-400">Loading incoming bookings...</div>}

        {!loading && error && (
          <EmptyState
            title="No data available"
            description={error}
            buttonLabel="Reload"
            buttonLink="/lawyer/bookings/incoming"
          />
        )}

        {!loading && !error && incoming.length === 0 && (
          <EmptyState
            title="No incoming bookings"
            description="New booking requests will appear here."
            buttonLabel="Refresh"
            buttonLink="/lawyer/bookings/incoming"
          />
        )}

        {!loading && !error && incoming.length > 0 && (
          <div className="space-y-3">
            {incoming.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="text-white font-semibold">Booking #{booking.id}</div>
                    <StatusPill status={booking.status || "pending"} />
                  </div>
                  <div className="text-sm text-slate-400">
                    Client: {booking.client_id ?? "—"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/lawyer/bookings/${booking.id}`}
                    className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium text-white transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    to="/lawyer/bookings/incoming"
                    className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-sm font-medium text-white transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
