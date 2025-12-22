import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDisputeById, updateDispute } from "../../services/disputes";

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  const getStatusClass = () => {
    switch (s) {
      case "PENDING":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-500/50";
      case "RESOLVED":
        return "bg-green-900/30 text-green-400 border-green-500/50";
      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };
  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-bold uppercase border ${getStatusClass()}`}
    >
      {s}
    </span>
  );
}

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "N/A";
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  } catch {
    return dateTimeStr;
  }
};

export default function DisputeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setError("");
    setSuccess("");
    try {
      setLoading(true);
      const data = await getDisputeById(id);
      setItem(data);
      setTitle(data?.title || "");
      setDescription(data?.description || "");
    } catch (e) {
      const message =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to load dispute.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canEdit = item && String(item.status).toUpperCase() === "PENDING";

  const onSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canEdit) return;

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateDispute(id, {
        title: title.trim(),
        description: description.trim(),
      });
      setItem(updated);
      setSuccess("Dispute updated successfully.");
    } catch (e) {
      const message =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to update dispute.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-gray-400">Loading dispute details...</div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-amber-400 hover:text-amber-300 mb-4"
            >
              ← Back
            </button>
          </div>
          <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-400">Dispute not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-amber-400 hover:text-amber-300 mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-green-200">
            {success}
          </div>
        )}

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dispute #{item.id}</h1>
              <StatusBadge status={item.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Client ID</h3>
              <p className="text-lg text-white">{item.client_id}</p>
            </div>
            {item.booking_id && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Booking ID</h3>
                <p className="text-lg text-white">{item.booking_id}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Created At</h3>
              <p className="text-lg text-white">{formatDateTime(item.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Last Updated</h3>
              <p className="text-lg text-white">{formatDateTime(item.updated_at)}</p>
            </div>
          </div>

          <form onSubmit={onSave} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                className={`w-full rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  canEdit
                    ? "bg-slate-700 border border-slate-600"
                    : "bg-slate-700/50 border border-slate-600/50 cursor-not-allowed"
                }`}
                value={title}
                disabled={!canEdit}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Description
              </label>
              <textarea
                className={`w-full rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y ${
                  canEdit
                    ? "bg-slate-700 border border-slate-600"
                    : "bg-slate-700/50 border border-slate-600/50 cursor-not-allowed"
                }`}
                rows={6}
                value={description}
                disabled={!canEdit}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {!canEdit && (
              <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-gray-300">
                This dispute cannot be edited because it is not PENDING. Only disputes with
                PENDING status can be modified.
              </div>
            )}

            {canEdit && (
              <div className="pt-4 border-t border-slate-700">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>

          {item.admin_note && (
            <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
              <div className="text-sm font-semibold text-amber-400 mb-2">Admin Note</div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">
                {item.admin_note}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
