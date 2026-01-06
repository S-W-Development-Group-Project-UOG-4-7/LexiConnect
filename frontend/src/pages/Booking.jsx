import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBooking,
  getLawyerServicePackages,
  getLawyerIdByUser,
} from "../services/bookings";
import { getMyCases, createCase as createCaseApi } from "../features/cases/services/cases.service";
import PageShell from "../components/ui/PageShell";
import api from "../services/api";

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
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [newCase, setNewCase] = useState({
    title: "",
    category: "",
    district: "",
    public_summary: "",
    private_summary: "",
  });
  const [checklistStatus, setChecklistStatus] = useState(null);
  const [checklistError, setChecklistError] = useState("");
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotRangeFrom, setSlotRangeFrom] = useState("");
  const [slotRangeTo, setSlotRangeTo] = useState("");

  useEffect(() => {
    const loadCases = async () => {
      try {
        const data = await getMyCases();
        setCases(data || []);
      } catch {
        // ignore silently; error shown on submit if needed
      }
    };
    loadCases();
  }, []);

  // Load checklist status when case + service are selected
  useEffect(() => {
    const fetchChecklist = async () => {
      setChecklistStatus(null);
      setChecklistError("");
      if (!selectedCaseId || !selectedServiceId) return;

      setChecklistLoading(true);
      try {
        // ✅ FIX: Correct backend path (matches OpenAPI)
        const res = await api.get(
          `/api/checklist-templates/cases/${selectedCaseId}/checklist/status`,
          { params: { service_package_id: selectedServiceId } }
        );
        setChecklistStatus(res.data);
      } catch (err) {
        if (err?.response?.status === 422) {
          setChecklistError("Complete checklist before booking.");
        } else {
          setChecklistError(
            err?.response?.data?.detail ||
              err?.response?.data?.message ||
              "Failed to load checklist status."
          );
        }
      } finally {
        setChecklistLoading(false);
      }
    };
    fetchChecklist();
  }, [selectedCaseId, selectedServiceId]);

  // Default slot range (today -> +14 days)
  useEffect(() => {
    const today = new Date();
    const from = today.toISOString().slice(0, 10);
    const future = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const to = future.toISOString().slice(0, 10);
    setSlotRangeFrom(from);
    setSlotRangeTo(to);
  }, []);

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

  // Load available slots when step 3 is reached and lawyer is resolved
  useEffect(() => {
    const fetchSlots = async () => {
      setSlotsError("");
      setAvailableSlots([]);
      setSlotsLoading(true);
      try {
        const lawyerParam =
          resolvedPackageLawyerId || prefilledLawyerId || (lawyerField ? Number(lawyerField) : null);
        if (!lawyerParam || !slotRangeFrom || !slotRangeTo) {
          setSlotsLoading(false);
          return;
        }
        const url = `/api/lawyer-availability/slots?from_date=${slotRangeFrom}&to_date=${slotRangeTo}&lawyer_id=${lawyerParam}`;
        const { data } = await api.get(url);
        const filtered = (data || []).filter((s) => !s.is_blackout);
        setAvailableSlots(filtered);
      } catch (err) {
        setSlotsError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load available slots."
        );
      } finally {
        setSlotsLoading(false);
      }
    };
    if (step >= 3) {
      fetchSlots();
    }
  }, [step, resolvedPackageLawyerId, prefilledLawyerId, lawyerField, slotRangeFrom, slotRangeTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const resolvedLawyerId = prefilledLawyerId || Number(lawyerField);
    if (!resolvedLawyerId || Number.isNaN(resolvedLawyerId)) {
      setError("Please provide a valid lawyer ID.");
      return;
    }

    if (!selectedCaseId) {
      setError("Please select a case.");
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
      case_id: selectedCaseId,
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

        {/* Step 1: Case */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-400 font-semibold">Step 1 · Select Case</div>
            <button
              type="button"
              onClick={() => setShowCaseModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm"
            >
              Create New Case
            </button>
          </div>
          <div className="space-y-2">
            <select
              value={selectedCaseId || ""}
              onChange={(e) => setSelectedCaseId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select a case</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} · {c.title}
                </option>
              ))}
            </select>
            {cases.length === 0 && <div className="text-slate-400 text-sm">No cases yet. Create one to continue.</div>}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!selectedCaseId) {
                  setError("Please select a case.");
                  return;
                }
                setStep(2);
                setError("");
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Next: Service
            </button>
          </div>
        </div>

        {/* Step 2: Service */}
        {step >= 2 && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2">
            <div className="text-sm text-amber-400 font-semibold">Step 2 · Choose Service</div>
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
                  if (!selectedCaseId) {
                    setError("Please select a case.");
                    return;
                  }
                  if (!selectedServiceId) {
                    setError("Please choose a service package.");
                    return;
                  }
                  setStep(3);
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
        )}

        {/* Step 3: Date & Time */}
        {step >= 3 && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2">
            <div className="text-sm text-amber-400 font-semibold">Step 3 · Choose Date & Time</div>
            <div className="space-y-3">
              <div className="text-sm text-slate-300">Available Slots (Next 14 Days)</div>
              {slotsLoading && <div className="text-slate-300 text-sm">Loading slots…</div>}
              {slotsError && (
                <div className="text-sm text-red-200 border border-red-700 bg-red-900/30 rounded-lg p-3">
                  {slotsError}
                </div>
              )}
              {!slotsLoading && !slotsError && availableSlots.length === 0 && (
                <div className="text-sm text-slate-400">No available slots in this range.</div>
              )}

              {!slotsLoading && availableSlots.length > 0 && (
                <div className="space-y-3">
                  {Object.entries(
                    availableSlots.reduce((acc, slot) => {
                      if (!acc[slot.date]) acc[slot.date] = [];
                      acc[slot.date].push(slot);
                      return acc;
                    }, {})
                  )
                    .sort(([a], [b]) => (a > b ? 1 : -1))
                    .map(([date, slots]) => (
                      <div key={date} className="border border-slate-700 rounded-lg p-3 bg-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-white font-semibold">{date}</div>
                          <div className="text-xs text-slate-400">{slots.length} slot(s)</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {slots.map((slot, idx) => {
                            const isSelected =
                              selectedSlot &&
                              selectedSlot.date === slot.date &&
                              selectedSlot.start_time === slot.start_time &&
                              selectedSlot.end_time === slot.end_time;
                            return (
                              <button
                                type="button"
                                key={`${slot.date}-${slot.start_time}-${idx}`}
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  setScheduledAt(`${slot.date}T${slot.start_time}`);
                                }}
                                className={`text-left w-full border rounded-lg p-3 transition-colors ${
                                  isSelected
                                    ? "border-amber-500 bg-amber-500/10"
                                    : "border-slate-700 bg-slate-900 hover:border-slate-500"
                                }`}
                              >
                                <div className="text-white font-semibold">
                                  {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                </div>
                                <div className="text-xs text-slate-300 mt-1">
                                  {slot.branch_name || "Branch"}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Hidden manual input kept for debugging but not required */}
              <input
                id="scheduled_at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="hidden"
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

            {checklistLoading && <div className="text-slate-300 text-sm">Checking checklist…</div>}
            {checklistError && (
              <div className="text-sm text-red-300 border border-red-700 bg-red-900/30 rounded-lg p-3">
                {checklistError}
              </div>
            )}
            {checklistStatus &&
              !checklistLoading &&
              checklistStatus.missing_required &&
              checklistStatus.missing_required.length === 0 && (
                <div className="text-sm text-emerald-200 border border-emerald-600/50 bg-emerald-900/30 rounded-lg p-3">
                  Checklist complete ✅ Booking unlocked.
                </div>
              )}
            {checklistStatus && checklistStatus.missing_required && checklistStatus.missing_required.length > 0 && (
              <div className="text-sm text-amber-200 border border-amber-500/40 bg-amber-500/10 rounded-lg p-3 space-y-2">
                <div className="font-semibold text-amber-100">Complete checklist before booking.</div>
                <div className="text-amber-100 text-xs">Missing required items:</div>
                <ul className="list-disc list-inside text-xs text-amber-100 space-y-1">
                  {checklistStatus.missing_required.map((item) => (
                    <li key={item.id}>{item.title || "Untitled item"}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/client/cases/${selectedCaseId}/checklist?service_package_id=${selectedServiceId}`
                    )
                  }
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm"
                >
                  Complete Checklist
                </button>
              </div>
            )}

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
                disabled={
                  loading ||
                  checklistLoading ||
                  (checklistStatus &&
                    checklistStatus.missing_required &&
                    checklistStatus.missing_required.length > 0)
                }
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

      {showCaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-white">Create New Case</div>
              <button onClick={() => setShowCaseModal(false)} className="text-slate-300 hover:text-white">
                ×
              </button>
            </div>
            <div className="space-y-2">
              <input
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                placeholder="Title"
                value={newCase.title}
                onChange={(e) => setNewCase((p) => ({ ...p, title: e.target.value }))}
              />
              <input
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                placeholder="Category"
                value={newCase.category}
                onChange={(e) => setNewCase((p) => ({ ...p, category: e.target.value }))}
              />
              <input
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                placeholder="District"
                value={newCase.district}
                onChange={(e) => setNewCase((p) => ({ ...p, district: e.target.value }))}
              />
              <textarea
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                placeholder="Public summary"
                rows={3}
                value={newCase.public_summary}
                onChange={(e) => setNewCase((p) => ({ ...p, public_summary: e.target.value }))}
              />
              <textarea
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                placeholder="Private summary (optional)"
                rows={3}
                value={newCase.private_summary}
                onChange={(e) => setNewCase((p) => ({ ...p, private_summary: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCaseModal(false)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    const created = await createCaseApi(newCase);
                    setCases((prev) => [created, ...prev]);
                    setSelectedCaseId(created.id);
                    setShowCaseModal(false);
                    setStep(2);
                    setError("");
                  } catch (err) {
                    const detail = err?.response?.data?.detail;
                    let message = "Failed to create case.";
                    if (Array.isArray(detail)) {
                      message = detail
                        .map((d) => d?.msg || d?.message || (typeof d === "string" ? d : JSON.stringify(d)))
                        .join("; ");
                    } else if (typeof detail === "string") {
                      message = detail;
                    }
                    setError(message);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm"
              >
                Save Case
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
