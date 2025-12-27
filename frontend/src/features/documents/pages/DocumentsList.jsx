import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { listDocuments, deleteDocument } from "../services/documents.service";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function DocumentsList() {
  const { bookingId } = useParams();
  const [docs, setDocs] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await listDocuments(bookingId);
      setDocs(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [bookingId]);

  const onDelete = async (doc) => {
    setErr("");

    const ok = window.confirm(
      `Delete "${doc.title || "Untitled"}"? This will remove the file too.`
    );
    if (!ok) return;

    try {
      setDeletingId(doc.id);
      await deleteDocument(doc.id);

      // remove from UI immediately
      setDocs((prev) => prev.filter((x) => x.id !== doc.id));
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Documents (Booking {bookingId})</h1>

        <Link
          to={`/client/bookings/${bookingId}/documents/upload`}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
        >
          Upload
        </Link>
      </div>

      {err && (
        <div className="bg-red-900/40 border border-red-700 p-3 rounded mb-3">
          {err}
        </div>
      )}

      {loading && <div className="opacity-70">Loading documents...</div>}

      {!loading && docs.length === 0 && !err && (
        <div className="opacity-70">No documents uploaded yet.</div>
      )}

      <div className="space-y-3">
        {docs.map((d) => {
          const fileUrl = `${API_BASE}${d.file_path.startsWith("/") ? "" : "/"}${
            d.file_path
          }`;

          const isDeleting = deletingId === d.id;

          return (
            <div
              key={d.id}
              className="bg-slate-800 border border-slate-700 rounded p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{d.title || "Untitled"}</div>
                <div className="text-xs opacity-60">Stored: {d.file_path}</div>
              </div>

              <div className="flex gap-3">
                {/* View */}
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-sm"
                >
                  View
                </a>

                {/* Delete */}
                <button
                  onClick={() => onDelete(d)}
                  disabled={isDeleting}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <Link to="/client/manage-bookings" className="opacity-80 underline">
          Back to My Bookings
        </Link>
      </div>
    </div>
  );
}
