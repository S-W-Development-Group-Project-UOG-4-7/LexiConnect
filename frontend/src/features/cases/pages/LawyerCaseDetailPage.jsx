import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../components/ui/PageShell";
import { getCaseById } from "../services/cases.service";
import { listLawyerCaseBookings } from "../../../services/bookings";
import { getUserFromToken } from "../../../services/auth";

export default function LawyerCaseDetailPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const cid = Number(caseId);

  const formatDateTime = (value) => {
    if (!value) return "—";
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(value)
      );
    } catch {
      return String(value);
    }
  };

  // Case
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState("documents");
  // Bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  // Load case
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getCaseById(cid);
        setData(res);
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to load case.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isFinite(cid) || cid <= 0) {
      setError("Invalid case id");
      setLoading(false);
      return;
    }

    load();
  }, [cid]);

  // Load bookings (lawyer scoped)
  useEffect(() => {
    const loadBookings = async () => {
      if (!Number.isFinite(cid) || cid <= 0) return;
      setBookingsLoading(true);
      setBookingsError("");
      try {
        const list = await listLawyerCaseBookings(cid);
        const safeList = Array.isArray(list) ? list : [];
        const user = getUserFromToken();
        const lawyerId = Number(user?.id);
        const filtered = Number.isFinite(lawyerId)
          ? safeList.filter((b) => Number(b.lawyer_id) === lawyerId)
          : safeList;
        setBookings(filtered);
      } catch (e) {
        setBookings([]);
        setBookingsError(
          e?.response?.data?.detail ||
            e?.response?.data?.message ||
            "Failed to load bookings."
        );
      } finally {
        setBookingsLoading(false);
      }
    };

    loadBookings();
  }, [cid]);

  const caseTitle = useMemo(() => data?.title || `Case #${cid}`, [data?.title, cid]);

  return (
    <PageShell
      title={caseTitle}
      subtitle="View case details"
      maxWidth="max-w-5xl"
      contentClassName="space-y-4"
    >
      {loading && <div className="text-slate-300 text-sm">Loading case…</div>}

      {error && !loading && (
        <div className="text-sm text-red-200 border border-red-700 bg-red-900/30 rounded-lg p-3">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase text-slate-400">Case</div>
              <div className="text-xl font-semibold text-white">{data.title}</div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-200">
              {data.status || "--"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-200">
            <div>
              <div className="text-slate-400 text-xs uppercase">Category</div>
              <div>{data.category || "--"}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase">District</div>
              <div>{data.district || "--"}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase">Created</div>
              <div>{formatDateTime(data.created_at)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase">Case ID</div>
              <div>{data.id}</div>
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-xs uppercase">Public Summary</div>
            <div className="text-slate-200 whitespace-pre-wrap">
              {data.summary_public || "--"}
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        {["documents", "bookings"].map((tabId) => {
          const active = activeTab === tabId;
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                active
                  ? "bg-amber-600/20 border-amber-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
              }`}
            >
              {tabId === "documents" ? "Documents" : "Bookings"}
            </button>
          );
        })}
      </div>

      {activeTab === "documents" && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="text-white font-semibold">Case Documents</div>
          <div className="text-sm text-slate-300">
            View and manage files uploaded for this case.
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate(`/lawyer/cases/${cid}/documents`)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-semibold"
            >
              Manage Documents
            </button>
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold">Case Bookings</div>
            <div className="text-xs text-slate-400">
              {bookingsLoading ? "Loading..." : `${bookings.length} bookings`}
            </div>
          </div>

          {bookingsError && !bookingsLoading && (
            <div className="text-sm text-red-200 border border-red-700 bg-red-900/30 rounded-lg p-3">
              {bookingsError}
            </div>
          )}

          {!bookingsLoading && !bookingsError && bookings.length === 0 && (
            <div className="text-sm text-slate-300">No bookings for this case yet.</div>
          )}

          {!bookingsLoading && bookings.length > 0 && (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white font-semibold">Booking #{b.id}</div>
                    <span className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-200">
                      {b.status || "?"}
                    </span>
                  </div>
                  <div className="text-sm text-slate-300">
                    Scheduled: {formatDateTime(b.scheduled_at)}
                  </div>
                  <div className="text-xs text-slate-500">Client #{b.client_id}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white"
        >
          Back
        </button>
      </div>
    </PageShell>
  );
}
