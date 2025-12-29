import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { listDocuments } from "../services/documents.service";
import PageShell from "../../../components/ui/PageShell";
import EmptyState from "../../../components/ui/EmptyState";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function LawyerDocumentsView() {
  const { bookingId } = useParams();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await listDocuments(bookingId);
        setDocs(res.data || []);
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  return (
    <PageShell
      title={`Booking #${bookingId} Documents`}
      subtitle="View uploaded documents (read-only)"
      maxWidth="max-w-4xl"
      contentClassName="space-y-4"
    >
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-100 p-3 rounded">
          {error}
        </div>
      )}
      {loading && <div className="text-slate-300">Loading documents...</div>}
      {!loading && !error && docs.length === 0 && (
        <EmptyState
          title="No documents"
          description="No documents were uploaded for this booking."
          buttonLabel="Back to booking"
          buttonLink={`/lawyer/bookings/${bookingId}`}
        />
      )}

      {!loading && !error && docs.length > 0 && (
        <div className="space-y-3">
          {docs.map((d) => {
            const fileUrl = `${API_BASE}${d.file_path?.startsWith("/") ? "" : "/"}${
              d.file_path || ""
            }`;
            return (
              <div
                key={d.id}
                className="bg-slate-800 border border-slate-700 rounded p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">{d.title || "Untitled"}</div>
                  <div className="text-xs text-slate-400">ID #{d.id}</div>
                </div>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm text-white"
                >
                  View
                </a>
              </div>
            );
          })}
        </div>
      )}

      <div>
        <Link
          to={`/lawyer/bookings/${bookingId}`}
          className="text-sm text-amber-300 hover:text-amber-200 underline"
        >
          Back to booking
        </Link>
      </div>
    </PageShell>
  );
}
