import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyBookingSummaries, cancelBooking } from "../services/bookings";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [dateFilter, setDateFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [lawyerQuery, setLawyerQuery] = useState("");
  const [caseQuery, setCaseQuery] = useState("");
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await listMyBookingSummaries();
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

  const statusConfig = {
    pending: {
      label: "Pending",
      badge: "bg-amber-900/30 text-amber-200 border border-amber-700/40",
    },
    confirmed: {
      label: "Confirmed",
      badge: "bg-emerald-900/30 text-emerald-200 border border-emerald-700/40",
    },
    rejected: {
      label: "Rejected",
      badge: "bg-rose-900/30 text-rose-200 border border-rose-700/40",
    },
    completed: {
      label: "Completed",
      badge: "bg-sky-900/30 text-sky-200 border border-sky-700/40",
    },
    cancelled: {
      label: "Cancelled",
      badge: "bg-red-900/30 text-red-300 border border-red-700/40",
    },
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    try {
      const date = new Date(dateTimeStr);
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch {
      return dateTimeStr;
    }
  };

  const serviceOptions = useMemo(() => {
    const set = new Set();
    bookings.forEach((b) => {
      if (b.service_name) set.add(b.service_name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [bookings]);

  const filtered = useMemo(() => {
    const now = new Date();
    const qLawyer = lawyerQuery.trim().toLowerCase();
    const qCase = caseQuery.trim().toLowerCase();
    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    const withinRange = (dt) => {
      if (!dt) return false;
      if (fromDate && dt < fromDate) return false;
      if (toDate && dt > toDate) return false;
      return true;
    };

    const filteredList = bookings.filter((b) => {
      const status = (b.status || "").toLowerCase();
      const matchesStatus =
        statusFilter === "All" || status === statusFilter.toLowerCase();

      const service = b.service_name || "";
      const matchesService = serviceFilter === "All" || service === serviceFilter;

      const matchesLawyer =
        !qLawyer ||
        (b.lawyer_name || "").toLowerCase().includes(qLawyer) ||
        (b.lawyer_email || "").toLowerCase().includes(qLawyer);

      const matchesCase =
        !qCase ||
        (b.case_title || "").toLowerCase().includes(qCase) ||
        (b.case_summary || "").toLowerCase().includes(qCase);

      const baseDate = new Date(b.scheduled_at || b.created_at || 0);

      let matchesDate = true;
      if (dateFilter === "Today") {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        matchesDate = baseDate >= start && baseDate <= end;
      } else if (dateFilter === "This Week") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        matchesDate = baseDate >= start && baseDate <= end;
      } else if (dateFilter === "This Month") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        matchesDate = baseDate >= start && baseDate <= end;
      } else if (dateFilter === "Custom") {
        matchesDate = withinRange(baseDate);
      }

      return matchesStatus && matchesService && matchesLawyer && matchesCase && matchesDate;
    });

    if (sortOrder === "Newest") {
      return filteredList.sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    }
    if (sortOrder === "Oldest") {
      return filteredList.sort(
        (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      );
    }
    if (sortOrder === "Upcoming") {
      const future = [];
      const past = [];
      filteredList.forEach((b) => {
        const dt = new Date(b.scheduled_at || b.created_at || 0);
        if (dt >= now) future.push(b);
        else past.push(b);
      });
      future.sort(
        (a, b) => new Date(a.scheduled_at || a.created_at || 0).getTime() -
          new Date(b.scheduled_at || b.created_at || 0).getTime()
      );
      past.sort(
        (a, b) => new Date(b.scheduled_at || b.created_at || 0).getTime() -
          new Date(a.scheduled_at || a.created_at || 0).getTime()
      );
      return [...future, ...past];
    }
    return filteredList;
  }, [
    bookings,
    statusFilter,
    sortOrder,
    dateFilter,
    dateFrom,
    dateTo,
    serviceFilter,
    lawyerQuery,
    caseQuery,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8 shadow-lg shadow-slate-900/30 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Client Portal</p>
            <h1 className="text-3xl font-bold text-white">My Bookings</h1>
            <p className="text-slate-300">
              Track upcoming consultations, manage documents, and stay on top of your case timeline.
            </p>
          </div>
          <button
            onClick={() => navigate("/client/search")}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-md shadow-amber-500/25 transition-colors"
          >
            Book a Lawyer
          </button>
        </section>

        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-lg shadow-slate-900/30 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-1 gap-3 flex-wrap">
              <input
                value={lawyerQuery}
                onChange={(e) => setLawyerQuery(e.target.value)}
                placeholder="Search lawyer name or email"
                className="flex-1 min-w-[220px] px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                value={caseQuery}
                onChange={(e) => setCaseQuery(e.target.value)}
                placeholder="Search case title"
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {["All", "Pending", "Confirmed", "Cancelled", "Rejected"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="All">All Services</option>
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {["All", "Today", "This Week", "This Month", "Custom"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {["Newest", "Oldest", "Upcoming"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {dateFilter === "Custom" && (
            <div className="flex flex-wrap gap-3">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                From
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>
              <label className="text-xs uppercase tracking-wide text-slate-400">
                To
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>
            </div>
          )}
        </section>

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <div
                key={k}
                className="animate-pulse bg-slate-900/60 border border-slate-800 rounded-xl p-4 h-28"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 text-center space-y-3 shadow-lg shadow-slate-900/30">
            <h3 className="text-lg font-semibold text-white">No bookings found</h3>
            <p className="text-slate-400 text-sm">
              Book a consultation to see it appear here.
            </p>
            <button
              onClick={() => navigate("/client/search")}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold transition-colors"
            >
              Find a Lawyer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const status = (booking.status || "").toLowerCase();
              const statusStyles = statusConfig[status]?.badge || statusConfig.pending.badge;
              const statusLabel = statusConfig[status]?.label || "Pending";

              return (
                <div
                  key={booking.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-lg shadow-slate-900/30 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold text-lg">
                        {booking.lawyer_name || "Lawyer"}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusStyles}`}>
                        {booking.status || "Unknown"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300">
                      Scheduled: {formatDateTime(booking.scheduled_at)}
                    </div>
                  </div>

                  <div className="text-sm text-slate-400 flex flex-wrap gap-3">
                    {booking.service_name && (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-slate-300 font-medium">Service:</span> {booking.service_name}
                      </span>
                    )}
                    {booking.case_title && (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-slate-300 font-medium">Case:</span> {booking.case_title}
                      </span>
                    )}
                    {(booking.branch_name || booking.branch_city) && (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-slate-300 font-medium">Branch:</span>{" "}
                        {[booking.branch_name, booking.branch_city].filter(Boolean).join(" - ")}
                      </span>
                    )}
                  </div>

                  {booking.case_summary && (
                    <div className="text-sm text-slate-400">
                      {booking.case_summary}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => navigate(`/client/bookings/${booking.id}`)}
                      className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm font-semibold text-white transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate(`/client/bookings/${booking.id}?tab=Documents`)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors"
                    >
                      Documents
                    </button>
                    {status !== "cancelled" && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={actionId === booking.id}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors"
                      >
                        {actionId === booking.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;

