import React from "react";
import { useParams, Link } from "react-router-dom";

export default function DocumentsListPlaceholder() {
  const { bookingId } = useParams();

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">Documents</h1>
      <p className="opacity-80 mb-4">
        Placeholder list page (Methsarani will plug in real list UI here).
      </p>

      <div className="bg-slate-800 rounded p-4 border border-slate-700">
        <p>
          <span className="font-semibold">Booking ID:</span> {bookingId}
        </p>
        <p className="opacity-70 text-sm mt-2">No documents loaded (placeholder).</p>
      </div>

      <div className="mt-4 flex gap-3">
        <Link
          to={`/client/bookings/${bookingId}/documents/upload`}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
        >
          Upload Documents
        </Link>

        <Link
          to="/client/manage-bookings"
          className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600"
        >
          Back to My Bookings
        </Link>
      </div>
    </div>
  );
}
