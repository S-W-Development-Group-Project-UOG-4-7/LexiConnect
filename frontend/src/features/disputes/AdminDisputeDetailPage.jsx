import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDisputeById, adminUpdateDispute } from "../../services/disputes";

export default function AdminDisputeDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await getDisputeById(id);
      setData(res.data);
      setAdminNote(res.data?.admin_note || "");
      setStatus(res.data?.status || "PENDING");
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message || "Failed to load dispute");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // This button should RESOLVE. So always send RESOLVED.
  const resolveDispute = async () => {
    setErr("");

    const payload = {
      status: "RESOLVED",
      admin_note: adminNote?.trim() || "",
    };

    try {
      await adminUpdateDispute(id, payload);
      await load();
      alert("Dispute resolved!");
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message || "Failed to resolve dispute");
    }
  };

  // Optional: allow admin to save without resolving (if you want).
  const saveChanges = async () => {
    setErr("");

    const payload = {
      status,
      admin_note: adminNote?.trim() || "",
    };

    // prevent empty/no-op payload (common cause of your backend error)
    if (!payload.status && !payload.admin_note) {
      setErr("Please set a status or add an admin note.");
      return;
    }

    try {
      await adminUpdateDispute(id, payload);
      await load();
      alert("Updated!");
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message || "Failed to update dispute");
    }
  };

  if (loading) return <div className="p-6 opacity-70">Loading…</div>;
  if (err) return <div className="p-6 text-red-200">{err}</div>;
  if (!data) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6">
      <button
        className="mb-4 px-3 py-2 rounded border border-white/10"
        onClick={() => nav(-1)}
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Dispute #{data.id}</h1>
      <div className="text-sm opacity-70 mb-4">Current Status: {data.status}</div>

      <div className="p-4 rounded bg-white/5 border border-white/10 mb-4">
        <div className="font-semibold">{data.title}</div>
        <div className="opacity-80 mt-2 whitespace-pre-wrap">{data.description}</div>
        <div className="text-xs opacity-60 mt-2">
          Client ID: {data.client_id} | Booking ID: {data.booking_id ?? "None"}
        </div>
      </div>

      <div className="p-4 rounded bg-white/5 border border-white/10">
        <div className="font-semibold mb-2">Admin Action</div>

        <label className="block text-sm mb-1 opacity-70">Status</label>
        <select
          className="w-full p-2 rounded bg-black/30 border border-white/10 mb-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="PENDING">PENDING</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>

        <label className="block text-sm mb-1 opacity-70">Admin Note</label>
        <textarea
          className="w-full p-2 rounded bg-black/30 border border-white/10"
          rows={4}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
        />

        <div className="flex gap-3 mt-3">
          <button
            onClick={saveChanges}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
          >
            Save Changes
          </button>

          <button
            onClick={resolveDispute}
            className="px-4 py-2 rounded bg-green-600/40 hover:bg-green-600/60 border border-white/10"
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  );
}
