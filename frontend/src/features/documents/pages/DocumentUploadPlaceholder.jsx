import React from "react";
import { useParams, Link } from "react-router-dom";

export default function DocumentUploadPlaceholder() {
  const { bookingId } = useParams();

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">Upload Documents</h1>
      <p className="opacity-80 mb-4">
        Placeholder page (Methsarani will plug in real upload UI here).
      </p>

      <div className="bg-slate-800 rounded p-4 border border-slate-700">
        <p>
          <span className="font-semibold">Booking ID:</span> {bookingId}
        </p>
      </div>

      <div className="mt-4 flex gap-3">
        <Link
          to={`/client/bookings/${bookingId}/documents`}
          className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600"
        >
          View Documents
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
