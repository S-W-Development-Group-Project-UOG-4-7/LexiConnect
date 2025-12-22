import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { listDocuments } from "../services/documents.service";

export default function DocumentsList() {
  const { bookingId } = useParams();
  const [docs, setDocs] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    listDocuments(bookingId)
      .then((res) => setDocs(res.data))
      .catch((e) => setErr(e?.response?.data?.detail || "Failed to load documents"));
  }, [bookingId]);

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

      <div className="space-y-3">
        {docs.map((d) => (
          <div key={d.id} className="bg-slate-800 border border-slate-700 rounded p-4">
            <div className="font-semibold">{d.file_name ?? d.title ?? "Untitled"}</div>
            <div className="text-sm opacity-70">Stored: {d.file_path}</div>
          </div>
        ))}

        {docs.length === 0 && !err && (
          <div className="opacity-70">No documents uploaded yet.</div>
        )}
      </div>

      <div className="mt-4">
        <Link to="/client/manage-bookings" className="opacity-80 underline">
          Back to My Bookings
        </Link>
      </div>
    </div>
  );
}
