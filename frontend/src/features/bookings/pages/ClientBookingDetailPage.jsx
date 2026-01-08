import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBookingById } from "../../../services/bookings";
import { listDocuments } from "../../documents/services/documents.service";
import { getIntakeByBooking, getIntakeByCase } from "../../intake/services/intake.service";
import api from "../../../services/api";

const tabs = ["Details", "Documents", "Intake", "Disputes", "Reviews"];

const statusStyles = {
  pending: "bg-yellow-900/30 text-yellow-200 border border-yellow-700/60",
  confirmed: "bg-green-900/30 text-green-200 border border-green-700/60",
  cancelled: "bg-red-900/30 text-red-200 border border-red-700/60",
  rejected: "bg-red-900/30 text-red-200 border border-red-700/60",
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const Card = ({ children }) => (
  <div className="bg-slate-900/40 border border-slate-700/70 rounded-xl p-5">
    {children}
  </div>
);

export default function ClientBookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Details");
  const [booking, setBooking] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(true);

  const [docs, setDocs] = useState([]);
  const [docError, setDocError] = useState("");
  const [docLoading, setDocLoading] = useState(true);

  const [intake, setIntake] = useState(null);
  const [intakeError, setIntakeError] = useState("");
  const [intakeLoading, setIntakeLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      setBookingError("");
      setBookingLoading(true);
      try {
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load booking.";
        setBookingError(message);
      } finally {
        setBookingLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  useEffect(() => {
    if (!booking) return;

    const loadDocs = async () => {
      setDocError("");
      setDocLoading(true);
      try {
        if (booking?.case_id) {
          const { data } = await api.get(`/api/documents/by-case/${booking.case_id}`);
          setDocs(data || []);
        } else {
          const res = await listDocuments(bookingId);
          setDocs(res.data || []);
        }
      } catch (err) {
        setDocError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load documents."
        );
      } finally {
        setDocLoading(false);
      }
    };

    const loadIntake = async () => {
      setIntakeError("");
      setIntakeLoading(true);
      try {
        if (booking?.case_id) {
          try {
            const data = await getIntakeByCase(booking.case_id);
            setIntake(data || null);
            return;
          } catch (err) {
            // fallback to booking-based if case call fails/404
            const res = await getIntakeByBooking(bookingId);
            setIntake(res.data || null);
            return;
          }
        }
        const res = await getIntakeByBooking(bookingId);
        setIntake(res.data || null);
      } catch (err) {
        if (err?.response?.status === 404) {
          setIntake(null);
        } else {
          setIntakeError(
            err?.response?.data?.detail ||
              err?.response?.data?.message ||
              "Failed to load intake status."
          );
        }
      } finally {
        setIntakeLoading(false);
      }
    };

    loadDocs();
    loadIntake();
  }, [bookingId, booking?.id, booking?.case_id, booking]);

  const statusClass = useMemo(() => {
    const key = (booking?.status || "").toLowerCase();
    return (
      statusStyles[key] ||
      "bg-slate-800 border border-slate-600 text-slate-100"
    );
  }, [booking]);

  const renderDetails = () => (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-sm text-slate-400">Booking ID</div>
            <div className="text-2xl font-semibold text-white">#{booking?.id}</div>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusClass}`}
          >
            {booking?.status || "Unknown"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-950/40 border border-slate-700/60 rounded-lg p-3">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">
              Lawyer
            </div>
            <div className="text-white font-medium">
              ID {booking?.lawyer_id ?? "-"}
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-700/60 rounded-lg p-3">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">
              Branch
            </div>
            <div className="text-white font-medium">
              ID {booking?.branch_id ?? "-"}
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-700/60 rounded-lg p-3">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">
              Scheduled
            </div>
            <div className="text-white font-medium">
              {formatDateTime(booking?.scheduled_at)}
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-700/60 rounded-lg p-3">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">
              Created
            </div>
            <div className="text-white font-medium">
              {formatDateTime(booking?.created_at)}
            </div>
          </div>
        </div>

        {booking?.note && (
          <div className="mt-4 bg-slate-950/40 border border-slate-700/60 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Client Note</div>
            <div className="text-white whitespace-pre-wrap">{booking.note}</div>
          </div>
        )}
      </Card>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Documents</div>
          <div className="text-slate-400 text-sm">
            Uploaded documents for this booking ({docs.length}).
          </div>
        </div>
        <Link
          to={`/client/bookings/${bookingId}/documents`}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
        >
          Manage Documents
        </Link>
      </div>

      {docLoading && <div className="text-slate-400">Loading documents…</div>}

      {docError && (
        <div className="p-3 rounded-lg border border-red-700/60 bg-red-900/30 text-red-200 text-sm">
          {docError}
        </div>
      )}

      {!docLoading && !docError && docs.length === 0 && (
        <Card>
          <div className="text-white font-semibold mb-1">No documents yet</div>
          <div className="text-slate-400 text-sm mb-4">
            Upload PDFs, images, or related files for your lawyer to review.
          </div>
          <Link
            to={`/client/bookings/${bookingId}/documents/upload`}
            className="inline-flex px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
          >
            Upload Document
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {docs.slice(0, 4).map((doc) => {
          const fileUrl = `${API_BASE}${doc.file_path?.startsWith("/") ? "" : "/"}${doc.file_path || ""}`;
          const fileName =
            doc.file_path?.split("/").pop() || doc.original_name || "file";

          return (
            <div
              key={doc.id}
              className="bg-slate-900/40 border border-slate-700/70 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="font-semibold text-white truncate">
                  {doc.title || "Untitled"}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {fileName} • #{doc.id}
                </div>
              </div>

              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
              >
                Open
              </a>
            </div>
          );
        })}
      </div>

      {docs.length > 4 && (
        <div className="text-sm text-slate-400">
          Showing 4 recent documents. Use <span className="text-white">Manage Documents</span> to view all.
        </div>
      )}
    </div>
  );

  const renderIntake = () => (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Intake Form</div>
          <div className="text-slate-400 text-sm">
            Provide details to help your lawyer prepare for the consultation.
          </div>
        </div>
        <Link
          to={`/client/bookings/${bookingId}/intake`}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium"
        >
          {intake ? "View / Update Intake" : "Fill Intake Form"}
        </Link>
      </div>

      {intakeLoading && <div className="text-slate-400">Checking intake status…</div>}

      {intakeError && (
        <div className="p-3 rounded-lg border border-red-700/60 bg-red-900/30 text-red-200 text-sm">
          {intakeError}
        </div>
      )}

      {!intakeLoading && !intakeError && !intake && (
        <Card>
          <div className="text-white font-semibold mb-1">No intake submitted yet</div>
          <div className="text-slate-400 text-sm mb-4">
            Completing the intake helps your lawyer understand your case faster.
          </div>
          <Link
            to={`/client/bookings/${bookingId}/intake`}
            className="inline-flex px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium"
          >
            Fill Intake Form
          </Link>
        </Card>
      )}

      {!intakeLoading && intake && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-400">Submitted</div>
            <div className="text-sm text-slate-200">
              {formatDateTime(intake.created_at || intake.updated_at)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <div className="text-slate-400 text-xs uppercase mb-1">Case Type</div>
              <div className="text-white font-medium">{intake.case_type || "-"}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase mb-1">Urgency</div>
              <div className="text-white font-medium">{intake.urgency || "-"}</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-slate-400 text-xs uppercase mb-1">Subject</div>
            <div className="text-white font-medium">{intake.subject || "-"}</div>
          </div>

          <div>
            <div className="text-slate-400 text-xs uppercase mb-1">Details</div>
            <div className="text-white whitespace-pre-wrap">
              {intake.details || "No details provided."}
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderDisputes = () => (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold mb-1">Disputes</div>
            <div className="text-slate-400 text-sm">
              Have an issue with this booking? Submit a dispute and we will review it.
            </div>
          </div>
          <Link
            to={`/disputes/submit?booking_id=${bookingId}`}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium"
          >
            Submit Dispute
          </Link>
        </div>

        <div className="mt-4 text-sm">
          <Link
            to="/disputes/my"
            className="text-amber-300 hover:text-amber-200 underline"
          >
            View my disputes
          </Link>
        </div>
      </Card>
    </div>
  );

  const renderReviews = () => (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold mb-1">Reviews</div>
          <div className="text-slate-400 text-sm">
            You will soon be able to rate and review your experience with the lawyer.
          </div>
        </div>
        <div className="text-3xl">⭐</div>
      </div>

      <div className="mt-4 text-sm text-slate-400">
        This is intentionally minimal for now. Chapa will implement full reviews later.
      </div>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Documents":
        return renderDocuments();
      case "Intake":
        return renderIntake();
      case "Disputes":
        return renderDisputes();
      case "Reviews":
        return renderReviews();
      default:
        return renderDetails();
    }
  };

  // ✅ Let layout handle full page background; keep content clean inside Outlet
  if (bookingLoading) {
    return <div className="text-slate-300">Loading booking…</div>;
  }

  if (bookingError || !booking) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 text-red-200 p-5 rounded-xl max-w-xl">
        <div className="font-semibold mb-2">Could not load booking</div>
        <div className="text-sm mb-4">{bookingError || "Booking not found."}</div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm"
          >
            Go Back
          </button>
          <Link
            to="/client/manage-bookings"
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm"
          >
            My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Booking</div>
          <h1 className="text-3xl font-bold text-white">#{booking.id}</h1>
        </div>

        <Link
          to="/client/manage-bookings"
          className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-sm text-white"
        >
          Back to My Bookings
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = activeTab === tab;
        return (
          <button
            key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                active
                  ? "bg-amber-600/20 border-amber-500 text-white"
                  : "bg-slate-900/30 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
              }`}
            >
              {tab}
              {tab === "Documents" && !docLoading && (
                <span className="ml-2 text-xs text-slate-400">({docs.length})</span>
              )}
              {tab === "Intake" && !intakeLoading && (
                <span className="ml-2 text-xs text-slate-400">
                  ({intake ? "Submitted" : "Pending"})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {renderTabContent()}
    </div>
  );
}
