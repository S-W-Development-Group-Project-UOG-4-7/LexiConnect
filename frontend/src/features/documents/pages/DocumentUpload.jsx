import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { uploadDocument } from "../services/documents.service";

export default function DocumentUpload() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!fileName.trim()) return setErr("File name is required");
    if (!file) return setErr("Please choose a file");

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("booking_id", bookingId);
      fd.append("file_name", fileName);
      fd.append("file", file);

      await uploadDocument(fd);
      navigate(`/client/bookings/${bookingId}/documents`);
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">Upload Document</h1>
      <p className="opacity-70 mb-4">Booking {bookingId}</p>

      {err && (
        <div className="bg-red-900/40 border border-red-700 p-3 rounded mb-3">
          {err}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-slate-800 border border-slate-700 rounded p-4 space-y-3"
      >
        <div>
          <label className="block mb-1 opacity-80">File name</label>
          <input
            className="w-full p-2 rounded bg-slate-900 border border-slate-700"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="e.g., NIC Scan / Agreement / Evidence"
          />
        </div>

        <div>
          <label className="block mb-1 opacity-80">File</label>
          <input
            type="file"
            className="w-full"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button
          disabled={loading}
          className={`px-4 py-2 rounded font-semibold ${
            loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        <div className="flex gap-3">
          <Link to={`/client/bookings/${bookingId}/documents`} className="underline opacity-80">
            View documents
          </Link>
          <Link to="/client/manage-bookings" className="underline opacity-80">
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}
