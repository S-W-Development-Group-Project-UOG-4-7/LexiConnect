import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBooking, getLawyerServicePackages, getLawyerIdByUser } from "../services/bookings";
import PageShell from "../components/ui/PageShell";

export default function Booking() {
  const { lawyerId } = useParams();
  const navigate = useNavigate();

  const prefilledLawyerId = useMemo(() => {
    const n = Number(lawyerId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [lawyerId]);

  const [lawyerField, setLawyerField] = useState(prefilledLawyerId ? String(prefilledLawyerId) : "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [resolvedPackageLawyerId, setResolvedPackageLawyerId] = useState(null);
  const [packagesCount, setPackagesCount] = useState(0);

  useEffect(() => {
    const loadServices = async () => {
      const userId = prefilledLawyerId || Number(lawyerField);
      if (!userId || Number.isNaN(userId)) return;
      try {
        let pkgLawyerId = null;
        try {
          pkgLawyerId = await getLawyerIdByUser(userId);
        } catch (err) {
          // If mapping fails (404), try treating userId as lawyerId directly
          if (err?.response?.status !== 404) throw err;
        }

        // fallback: treat route param as lawyer id
        if (!pkgLawyerId) {
          pkgLawyerId = userId;
        }

        setResolvedPackageLawyerId(pkgLawyerId);
        const data = await getLawyerServicePackages(pkgLawyerId);
        setServices(data || []);
        setPackagesCount((data || []).length);
        console.debug("[booking] packages debug", {
          routeParam: userId,
          resolvedLawyerId: pkgLawyerId,
          packagesCount: (data || []).length,
        });
      } catch (err) {
        setServices([]);
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load service packages.";
        setError(message);
        setPackagesCount(0);
      }
    };
    loadServices();
  }, [prefilledLawyerId, lawyerField]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const resolvedLawyerId = prefilledLawyerId || Number(lawyerField);
    if (!resolvedLawyerId || Number.isNaN(resolvedLawyerId)) {
      setError("Please provide a valid lawyer ID.");
      return;
    }

    if (!selectedServiceId) {
      setError("Please choose a service package.");
      return;
    }

    if (!scheduledAt) {
      setError("Please choose a date and time.");
      return;
    }

    const payload = {
      lawyer_id: resolvedLawyerId,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      note: note.trim() || undefined,
      service_package_id: selectedServiceId,
    };

    try {
      setLoading(true);
      await createBooking(payload);
      navigate("/client/manage-bookings");
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
    <PageShell
      title="Book an Appointment"
      subtitle="Select your slot and confirm the booking"
      maxWidth="max-w-3xl"
      contentClassName="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-5"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <div className="text-sm text-slate-400">Lawyer</div>
          <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg p-3">
            <div className="text-white font-semibold">
              {prefilledLawyerId ? `ID #${prefilledLawyerId}` : "Specify lawyer ID"}
            </div>
            {!prefilledLawyerId && (
              <input
                type="number"
                min="1"
                value={lawyerField}
                onChange={(e) => setLawyerField(e.target.value)}
                className="w-32 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. 12"
                required
              />
            )}
          </div>
        </div>

        {/* Step 1: Service */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2">
          <div className="text-sm text-amber-400 font-semibold">Step 1 · Choose Service</div>
          <div className="space-y-2">
            {services.length === 0 && (
              <div className="text-slate-400 text-sm">No service packages found for this lawyer.</div>
            )}
            {services.map((svc) => (
              <label
                key={svc.id}
                className={`flex items-start justify-between rounded-lg border p-3 cursor-pointer ${
                  selectedServiceId === svc.id ? "border-amber-500 bg-slate-800" : "border-slate-700 bg-slate-900"
                }`}
              >
                <div className="space-y-1">
                  <div className="text-white font-semibold">{svc.name}</div>
                  <div className="text-slate-400 text-sm">{svc.description}</div>
                  <div className="text-slate-300 text-sm">
                    LKR {svc.price_lkr} · {svc.duration_minutes} mins
                  </div>
                </div>
                <input
                  type="radio"
                  name="service_package"
                  checked={selectedServiceId === svc.id}
                  onChange={() => setSelectedServiceId(svc.id)}
                  className="mt-1"
                />
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!selectedServiceId) {
                  setError("Please choose a service package.");
                  return;
                }
                setStep(2);
                setError("");
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Next: Date & Time
            </button>
            </div>
            <div className="text-xs text-slate-400">
              Debug · Route user id: {prefilledLawyerId || lawyerField || "n/a"} · Service lookup lawyer id:{" "}
              {resolvedPackageLawyerId || "n/a"} · Packages: {packagesCount}
            </div>
          </div>

        {/* Step 2: Date & Time */}
        {step >= 2 && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2">
            <div className="text-sm text-amber-400 font-semibold">Step 2 · Choose Date & Time</div>
            <div className="space-y-1">
              <label className="text-sm text-slate-400" htmlFor="scheduled_at">
                Date & time <span className="text-red-400">*</span>
              </label>
              <input
                id="scheduled_at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-400" htmlFor="note">
                Note (optional)
              </label>
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                placeholder="Share any context for the lawyer..."
              />
            </div>

            <div className="text-xs text-slate-400">
              Debug · Selected service: {selectedServiceId || "none"} · Scheduled: {scheduledAt || "not set"}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
      </form>
    </PageShell>
  );
}
