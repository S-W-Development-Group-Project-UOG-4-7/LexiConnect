import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createBooking } from "../services/bookings";

const Booking = () => {
  const { lawyerId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    lawyer_id: lawyerId || "",
    scheduled_at: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        lawyer_id: Number(form.lawyer_id),
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      };

      await createBooking(payload);
      setSuccess("Booking created successfully!");
      
      // Clear form and optionally redirect
      setForm({ lawyer_id: "", scheduled_at: "" });
      
      // Optionally redirect to bookings list after a short delay
      setTimeout(() => {
        navigate("/client/manage-bookings");
      }, 2000);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Booking failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Booking</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Lawyer ID <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="lawyer_id"
              value={form.lawyer_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter lawyer ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Scheduled At (optional)
            </label>
            <input
              type="datetime-local"
              name="scheduled_at"
              value={form.scheduled_at}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-900/30 border border-green-500/50 rounded-lg text-green-200 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Creating..." : "Create Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;

