import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/ui/EmptyState";
import StatusPill from "../components/ui/StatusPill";
import { listMyBookings } from "../services/bookings";
import { fetchPublicCases } from "../features/publicFeed/services/publicFeedApi";
import { getSpecializations } from "../features/cases/services/cases.service";

const formatDateTime = (value) => {
  if (!value) return "--";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publicCases, setPublicCases] = useState([]);
  const [publicCasesLoading, setPublicCasesLoading] = useState(true);
  const [publicCasesError, setPublicCasesError] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(true);
  const [publicFilters, setPublicFilters] = useState({
    q: "",
    district: "",
    specialization_id: "",
    sort: "latest",
  });
  const userName = useMemo(() => {
    const email = localStorage.getItem("email") || "";
    const fallback = email ? email.split("@")[0] : "Client";
    return fallback || "Client";
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await listMyBookings();
        setBookings(data || []);
      } catch (err) {
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Could not load bookings.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadSpecializations = async () => {
      try {
        const data = await getSpecializations();
        if (!mounted) return;
        setSpecializations(Array.isArray(data) ? data : []);
      } catch {
        if (!mounted) return;
        setSpecializations([
          { id: 1, name: "Family Law" },
          { id: 2, name: "Property & Conveyancing" },
          { id: 3, name: "Corporate & Contracts" },
          { id: 4, name: "Criminal Defense" },
        ]);
      } finally {
        if (mounted) {
          setSpecializationsLoading(false);
        }
      }
    };
    loadSpecializations();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setPublicCasesLoading(true);
    setPublicCasesError("");

    const timeout = setTimeout(async () => {
      try {
        const params = {
          q: publicFilters.q || undefined,
          district: publicFilters.district || undefined,
          specialization_id: publicFilters.specialization_id
            ? Number(publicFilters.specialization_id)
            : undefined,
          sort: publicFilters.sort || "latest",
          limit: 6,
          offset: 0,
        };
        const data = await fetchPublicCases(params);
        if (!mounted) return;
        setPublicCases(Array.isArray(data) ? data : []);
      } catch {
        if (!mounted) return;
        setPublicCasesError("Unable to load public cases right now.");
      } finally {
        if (mounted) {
          setPublicCasesLoading(false);
        }
      }
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [publicFilters]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(
      (b) => (b.status || "").toString().toLowerCase() === "pending"
    ).length;
    const now = new Date();
    const upcoming = bookings.filter((b) => {
      if (!b?.scheduled_at) return false;
      const when = new Date(b.scheduled_at);
      return !Number.isNaN(when.getTime()) && when > now;
    }).length;
    return [
      { label: "Total bookings", value: total || 0, hint: "All consultations" },
      { label: "Pending bookings", value: pending || 0, hint: "Awaiting confirmation" },
      { label: "Upcoming bookings", value: upcoming || 0, hint: "Scheduled ahead" },
      {
        label: "Discussions shown",
        value: publicCases.length || 0,
        hint: "Matches your filters",
      },
    ];
  }, [bookings, publicCases.length]);

  const recentBookings = bookings.slice(0, 5);
  const recentActivity = recentBookings.slice(0, 3);

  return (
    <div className="min-h-screen w-full text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 md:p-8 shadow-lg shadow-slate-900/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-amber-300">
                  Welcome back, {userName}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  What would you like to do today?
                </h1>
                <p className="text-slate-300 max-w-3xl">
                  Post a legal issue, book a consultation, or continue an active case.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/client/cases?create=1"
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-md shadow-amber-500/25 transition-colors"
                >
                  Post Legal Issue
                </Link>
                <Link
                  to="/client/search"
                  className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-semibold transition-colors"
                >
                  Search Lawyers
                </Link>
                <Link
                  to="/client/manage-bookings"
                  className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-semibold transition-colors"
                >
                  My Bookings
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
            <div className="text-lg font-semibold text-white">Summary</div>
            <div className="text-sm text-slate-400 mb-4">
              Your current activity overview.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 rounded-xl border border-slate-800/60 bg-slate-950/40 p-4"
                >
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    {item.label}
                  </div>
                  <div className="text-2xl font-semibold text-white mt-2">
                    {item.value}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{item.hint}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4 shadow-lg shadow-slate-900/30 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">Public Legal Discussions</div>
                  <div className="text-sm text-slate-400">
                    Comment on real issues and see what others are discussing.
                  </div>
                </div>
                <Link
                  to="/public/cases"
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm font-semibold text-white transition-colors"
                >
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <input
                  value={publicFilters.q}
                  onChange={(e) => setPublicFilters((f) => ({ ...f, q: e.target.value }))}
                  placeholder="Search by keyword"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <select
                  value={publicFilters.district}
                  onChange={(e) => setPublicFilters((f) => ({ ...f, district: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {["", "Colombo", "Kandy", "Galle", "Jaffna", "Gampaha"].map((d) => (
                    <option key={d || "all"} value={d}>
                      {d || "All districts"}
                    </option>
                  ))}
                </select>
                <select
                  value={publicFilters.specialization_id}
                  onChange={(e) =>
                    setPublicFilters((f) => ({ ...f, specialization_id: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">
                    {specializationsLoading ? "Loading..." : "All specializations"}
                  </option>
                  {!specializationsLoading &&
                    specializations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
                <select
                  value={publicFilters.sort}
                  onChange={(e) => setPublicFilters((f) => ({ ...f, sort: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="latest">Latest</option>
                  <option value="most_commented">Most Discussed</option>
                </select>
              </div>

              {publicCasesError && <div className="text-sm text-red-300">{publicCasesError}</div>}

              {publicCasesLoading ? (
                <div className="text-slate-400">Loading public cases...</div>
              ) : publicCases.length === 0 ? (
                <div className="text-slate-400">No public cases found</div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {publicCases.map((c) => (
                    <div
                      key={c.id}
                      className="border border-slate-800 rounded-xl bg-slate-900/70 p-4 space-y-3"
                    >
                      <div className="text-lg font-semibold text-white">{c.title}</div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                        <span>{c.district || "--"}</span>
                        <span>|</span>
                        <span>{c.specialization_name || c.category || "--"}</span>
                        <span>|</span>
                        <span>{c.comment_count || 0} comments</span>
                      </div>
                      <div className="text-xs text-slate-500">{formatDateTime(c.created_at)}</div>
                      <Link
                        to={`/public/cases/${c.id}`}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm font-semibold text-white transition-colors"
                      >
                        Open discussion
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-lg font-semibold text-white">Recent Activity</div>
                  <div className="text-sm text-slate-400">Your latest updates</div>
                </div>
                <Link
                  to="/client/manage-bookings"
                  className="text-sm text-amber-300 hover:text-amber-200 underline"
                >
                  View all
                </Link>
              </div>

              {loading && <div className="text-slate-400">Loading activity...</div>}

              {!loading && error && (
                <EmptyState
                  title="No data available"
                  description={error}
                  buttonLabel="Try again"
                  buttonLink="/client/manage-bookings"
                />
              )}

              {!loading && !error && recentActivity.length === 0 && (
                <EmptyState
                  title="No activity yet"
                  description="Book your first consultation to start building your case history."
                  buttonLabel="Find a lawyer"
                  buttonLink="/client/search"
                />
              )}

              {!loading && !error && recentActivity.length > 0 && (
                <div className="space-y-3">
                  {recentActivity.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <div className="text-white font-semibold min-w-0">
                            Booking #{booking.id}
                          </div>
                          <StatusPill status={booking.status} />
                        </div>
                        <div className="text-sm text-slate-400">
                          Scheduled: {formatDateTime(booking.scheduled_at)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <Link
                          to={`/client/bookings/${booking.id}`}
                          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm font-medium text-white transition-colors whitespace-nowrap"
                        >
                          View
                        </Link>
                        <Link
                          to={`/client/bookings/${booking.id}/documents`}
                          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white transition-colors whitespace-nowrap"
                        >
                          Documents
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
