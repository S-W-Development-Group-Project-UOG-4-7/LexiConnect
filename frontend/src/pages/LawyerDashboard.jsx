import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageShell from "../components/ui/PageShell";
import StatGrid from "../components/ui/StatGrid";
import EmptyState from "../components/ui/EmptyState";
import { lawyerListIncomingBookings } from "../services/bookings";
import StatusPill from "../components/ui/StatusPill";

export default function LawyerDashboard() {
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      { label: "Today’s Bookings", value: incomingCount || "—", hint: "New requests" },
      { label: "Pending Requests", value: "—", hint: "Case feed / requests" },
      { label: "Open Cases", value: "—", hint: "Case feed" },
      { label: "Verified Status", value: <StatusPill status="Pending" /> },
    ];
  }, [incoming]);

  return (
    <PageShell
      title="Lawyer Dashboard"
      subtitle="Stay on top of your practice and case opportunities"
      contentClassName="space-y-8"
    >
      {/* Hero */}
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900 to-slate-950 p-6 md:p-8 shadow-lg shadow-slate-900/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">For Lawyers</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Grow your practice. Win the right cases.
            </h1>
            <p className="text-slate-300 max-w-3xl">
              Review incoming bookings, manage your availability, and jump into the case feed to request access to new clients.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/lawyer/cases/feed")}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-md shadow-amber-500/25 transition-transform hover:-translate-y-0.5"
            >
              Go to Case Feed
            </button>
            <button
              onClick={() => navigate("/lawyer/bookings/incoming")}
              className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-semibold transition-colors"
            >
              Incoming Bookings
            </button>
            <button
              onClick={() => navigate("/lawyer/cases/requests")}
              className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-semibold transition-colors"
            >
              My Requests
            </button>
            <button
              onClick={() => navigate("/lawyer/availability")}
              className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-semibold transition-colors"
            >
              Availability
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatGrid items={stats} className="md:grid-cols-4" />

      {/* Premium quick links */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Case Feed",
            desc: "Browse open cases and request access.",
            onClick: () => navigate("/lawyer/cases/feed"),
            accent: "from-amber-500/20 via-slate-900 to-slate-950",
          },
          {
            title: "Incoming Bookings",
            desc: "Confirm or reject client booking requests.",
            onClick: () => navigate("/lawyer/bookings/incoming"),
            accent: "from-blue-500/20 via-slate-900 to-slate-950",
          },
          {
            title: "My Requests",
            desc: "Track your case access requests.",
            onClick: () => navigate("/lawyer/cases/requests"),
            accent: "from-emerald-500/20 via-slate-900 to-slate-950",
          },
          {
            title: "Availability",
            desc: "Manage your weekly schedule and blackouts.",
            onClick: () => navigate("/lawyer/availability"),
            accent: "from-purple-500/20 via-slate-900 to-slate-950",
          },
          {
            title: "Token Queue",
            desc: "See today’s consultation queue.",
            onClick: () => navigate("/lawyer/token-queue"),
            accent: "from-cyan-500/20 via-slate-900 to-slate-950",
          },
          {
            title: "KYC & Branches",
            desc: "Maintain compliance and locations.",
            onClick: () => navigate("/lawyer/kyc"),
            accent: "from-rose-500/20 via-slate-900 to-slate-950",
          },
        ].map((card) => (
          <button
            key={card.title}
            onClick={card.onClick}
            className={`text-left rounded-2xl border border-slate-800 bg-gradient-to-br ${card.accent} p-4 hover:-translate-y-0.5 transition-transform shadow-lg shadow-slate-900/30`}
          >
            <div className="text-lg font-semibold text-white">{card.title}</div>
            <div className="text-sm text-slate-300 mt-1">{card.desc}</div>
          </button>
        ))}
      </section>

      {/* Incoming bookings preview */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
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
