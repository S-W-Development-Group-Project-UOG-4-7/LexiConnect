// frontend/src/features/intake/pages/ClientIntakeSubmitPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  submitIntake,
  getIntakeByBooking,
  updateIntake,
  deleteIntake,
} from "../services/intake.service";

// ✅ you MUST fetch booking details to show derived case type BEFORE intake exists.
// Change the import/function name if your bookings service exports differently.
import { getBookingById } from "../../../services/bookings"; // <-- adjust if needed

const URGENCY = ["Low", "Medium", "High"];

function buildAnswersJson(rows) {
  const out = {};
  for (const row of rows) {
    const k = (row.key || "").trim();
    const v = (row.value || "").trim();
    if (!k) continue;
    out[k] = v;
  }
  return out;
}

function answersToRows(obj) {
  if (!obj || typeof obj !== "object") return [{ key: "", value: "" }];
  const entries = Object.entries(obj);
  if (!entries.length) return [{ key: "", value: "" }];
  return entries.map(([k, v]) => ({ key: k, value: String(v ?? "") }));
}

// ✅ safe extractor for "case type" from a booking payload (handles different schemas)
function deriveCaseTypeFromBooking(booking) {
  if (!booking) return "—";

  // common names you might have
  const direct =
    booking.case_type ||
    booking.caseType ||
    booking.caseCategory ||
    booking.category;
  if (direct) return String(direct);

  // if booking has embedded case object
  const c = booking.case || booking.case_obj;
  if (c) {
    const v = c.case_type || c.caseType || c.type || c.category;
    if (v) return String(v);
  }

  return "General";
}

export default function ClientIntakeSubmitPage() {
  const { bookingId } = useParams();
  const bookingIdNum = Number(bookingId);
  const hasValidBookingId = Number.isFinite(bookingIdNum) && bookingIdNum > 0;

  // booking info (for derived case type)
  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);

  // server intake
  const [existingIntake, setExistingIntake] = useState(null);
  const [loadingIntake, setLoadingIntake] = useState(true);

  // form fields
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [urgency, setUrgency] = useState(URGENCY[1]);
  const [qaRows, setQaRows] = useState([{ key: "", value: "" }]);

  // ui states
  const [mode, setMode] = useState("create"); // create | view | edit
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const answersJson = useMemo(() => buildAnswersJson(qaRows), [qaRows]);

  const canSave =
    hasValidBookingId &&
    subject.trim().length >= 3 &&
    details.trim().length >= 10 &&
    !submitting;

  const readOnly = mode === "view";

  // -------------------------
  // Load booking details
  // -------------------------
  useEffect(() => {
    if (!hasValidBookingId) return;
    let mounted = true;

    async function loadBooking() {
      setLoadingBooking(true);
      try {
        // booking service may return {data: {...}} or plain object
        const res = await getBookingById(bookingIdNum);
        const data = res?.data ?? res;
        if (!mounted) return;
        setBooking(data || null);
      } catch (e) {
        if (!mounted) return;
        // don't hard-block intake UI, just show fallback case type
        console.error("Failed to load booking", e);
      } finally {
        if (mounted) setLoadingBooking(false);
      }
    }

    loadBooking();
    return () => {
      mounted = false;
    };
  }, [bookingIdNum, hasValidBookingId]);

  // -------------------------
  // Load existing intake
  // -------------------------
  useEffect(() => {
    if (!hasValidBookingId) return;

    let mounted = true;

    async function loadIntake() {
      setLoadingIntake(true);
      setErr("");
      setSuccess("");

      try {
        const res = await getIntakeByBooking(bookingIdNum);
        if (!mounted) return;

        const data = res?.data || null;
        setExistingIntake(data);

        // prefill form
        setUrgency(data?.urgency || URGENCY[1]);
        setSubject(data?.subject || "");
        setDetails(data?.details || "");
        setQaRows(answersToRows(data?.answers_json || {}));

        setMode("view");
      } catch (e) {
        if (!mounted) return;

        if (e?.response?.status === 404) {
          // No intake yet -> create mode
          setExistingIntake(null);
          setMode("create");
        } else {
          const status = e?.response?.status;
          if (status === 401) setErr("Unauthorized. Please login again.");
          else if (status === 403) setErr("You are not allowed to view this intake.");
          else setErr(e?.response?.data?.detail || "Failed to load intake");
        }
      } finally {
        if (mounted) setLoadingIntake(false);
      }
    }

    loadIntake();
    return () => {
      mounted = false;
    };
  }, [bookingIdNum, hasValidBookingId]);

  function addRow() {
    setQaRows((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeRow(idx) {
    setQaRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateRow(idx, field, value) {
    setQaRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSuccess("");

    if (!canSave) {
      if (!hasValidBookingId) setErr("Missing/invalid booking id.");
      return;
    }

    try {
      setSubmitting(true);

      if (mode === "create") {
        // ✅ CREATE expects: booking_id, subject, details, urgency, extra_answers
        const payload = {
          subject: subject.trim(),
          details: details.trim(),
          urgency,
          extra_answers: Object.keys(answersJson).length ? answersJson : {},
        };

        const res = await submitIntake(bookingIdNum, payload);
        setExistingIntake(res?.data || null);
        setMode("view");
        setSuccess("Intake submitted successfully.");
        return;
      }

      if (mode === "edit") {
        if (!existingIntake?.id) {
          setErr("Missing intake id for update.");
          return;
        }

        // ✅ UPDATE expects: subject/details/urgency/answers_json
        const payload = {
          subject: subject.trim(),
          details: details.trim(),
          urgency,
          answers_json: Object.keys(answersJson).length ? answersJson : {},
        };

        const res = await updateIntake(existingIntake.id, payload);
        setExistingIntake(res?.data || null);
        setMode("view");
        setSuccess("Intake updated successfully.");
      }
    } catch (e2) {
      const status = e2?.response?.status;

      if (status === 401) setErr("Unauthorized. Please login again.");
      else if (status === 403) setErr("You are not allowed to submit/update this intake.");
      else if (status >= 500) setErr("Server error while saving intake. Check backend logs.");
      else setErr(e2?.response?.data?.detail || "Failed to save intake");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    setErr("");
    setSuccess("");

    if (!hasValidBookingId) return;

    const ok = window.confirm("Delete this intake form? This cannot be undone.");
    if (!ok) return;

    try {
      setSubmitting(true);
      await deleteIntake(bookingIdNum);

      // reset UI
      setExistingIntake(null);
      setMode("create");
      setUrgency(URGENCY[1]);
      setSubject("");
      setDetails("");
      setQaRows([{ key: "", value: "" }]);

      setSuccess("Intake deleted.");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) setErr("Unauthorized. Please login again.");
      else if (status === 403) setErr("You are not allowed to delete this intake.");
      else setErr(e?.response?.data?.detail || "Failed to delete intake");
    } finally {
      setSubmitting(false);
    }
  }

  function onEdit() {
    setErr("");
    setSuccess("");
    setMode("edit");
  }

  function onCancelEdit() {
    setErr("");
    setSuccess("");

    // restore from existingIntake
    const data = existingIntake;
    setUrgency(data?.urgency || URGENCY[1]);
    setSubject(data?.subject || "");
    setDetails(data?.details || "");
    setQaRows(answersToRows(data?.answers_json || {}));

    setMode("view");
  }

  // ✅ derived case type to display
  const derivedCaseType =
    existingIntake?.case_type || deriveCaseTypeFromBooking(booking);

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Client Intake Form</h1>
            <div className="text-sm opacity-80 mt-1">
              Booking{" "}
              <span className="font-semibold">
                #{hasValidBookingId ? bookingIdNum : bookingId ?? "N/A"}
              </span>{" "}
              - help your lawyer understand your case quickly.
            </div>

            {existingIntake && (
              <div className="mt-2 text-sm opacity-80">
                Status: <span className="font-semibold">Submitted</span>{" "}
                {existingIntake?.updated_at && (
                  <>
                    (Last update:{" "}
                    {new Date(existingIntake.updated_at).toLocaleString()})
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/client/bookings/${bookingIdNum}`}
              className="px-3 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
            >
              Back
            </Link>

            {existingIntake && mode === "view" && (
              <>
                <button
                  onClick={onEdit}
                  className="px-3 py-2 rounded bg-amber-600 hover:bg-amber-700"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-700"
                  disabled={submitting}
                >
                  Delete
                </button>
              </>
            )}

            {mode === "edit" && (
              <button
                onClick={onCancelEdit}
                className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600"
                disabled={submitting}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {!hasValidBookingId && (
          <div className="mb-4 rounded border border-amber-700 bg-amber-900/30 p-3">
            Invalid booking id in URL. Open this page from a Booking Details page.
          </div>
        )}

        {(loadingBooking || loadingIntake) && (
          <div className="mb-4 rounded border border-slate-700 bg-slate-900/60 p-3 opacity-80">
            Loading...
          </div>
        )}

        {err && (
          <div className="mb-4 rounded border border-red-700 bg-red-900/40 p-3">
            {err}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded border border-emerald-700 bg-emerald-900/30 p-3">
            {success}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-slate-700 bg-slate-900/60 p-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ✅ Case Type display only */}
            <div>
              <label className="text-sm opacity-90">Case Type</label>
              <div className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 opacity-90">
                {derivedCaseType}
              </div>
              <div className="text-xs opacity-70 mt-1">
                Case type is derived from your booking and cannot be edited here.
              </div>
            </div>

            <div>
              <label className="text-sm opacity-90">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                disabled={readOnly}
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 disabled:opacity-60"
              >
                {URGENCY.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <div className="text-xs opacity-70 mt-1">
                High = time-sensitive, court deadlines, police matters, etc.
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm opacity-90">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={readOnly}
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 disabled:opacity-60"
              />
              <div className="text-xs opacity-70 mt-1">Keep it short and clear.</div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm opacity-90">Details</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={readOnly}
                rows={6}
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 disabled:opacity-60"
              />
              <div className="text-xs opacity-70 mt-1">
                Tip: include dates, amounts, messages, agreements, and witnesses.
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-700 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">Additional Answers (Optional)</div>
                <div className="text-xs opacity-70">
                  Add any structured info (e.g., "Employer Name", "NIC", "Police Station").
                </div>
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={addRow}
                  className="px-3 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
                >
                  + Add Field
                </button>
              )}
            </div>

            <div className="space-y-2">
              {qaRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                >
                  <input
                    value={row.key}
                    onChange={(e) => updateRow(idx, "key", e.target.value)}
                    placeholder="Field name"
                    disabled={readOnly}
                    className="md:col-span-4 rounded bg-slate-800 border border-slate-700 px-3 py-2 disabled:opacity-60"
                  />
                  <input
                    value={row.value}
                    onChange={(e) => updateRow(idx, "value", e.target.value)}
                    placeholder="Value"
                    disabled={readOnly}
                    className="md:col-span-7 rounded bg-slate-800 border border-slate-700 px-3 py-2 disabled:opacity-60"
                  />
                  <div className="md:col-span-1 flex justify-end">
                    {!readOnly && qaRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="px-3 py-2 rounded bg-red-600 hover:bg-red-700"
                        title="Remove"
                      >
                        x
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm opacity-80 hover:opacity-100">
                Preview JSON
              </summary>
              <pre className="mt-2 bg-slate-950/60 border border-slate-700 rounded p-3 text-xs overflow-auto">
                {JSON.stringify(answersJson, null, 2)}
              </pre>
            </details>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Link
              to={hasValidBookingId ? `/client/bookings/${bookingIdNum}/documents` : "#"}
              className={`opacity-80 underline ${
                hasValidBookingId ? "" : "pointer-events-none opacity-40"
              }`}
            >
              View Documents
            </Link>

            {(mode === "create" || mode === "edit") && (
              <button
                type="submit"
                disabled={!canSave}
                className={`px-5 py-2 rounded font-semibold ${
                  canSave
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-slate-700 cursor-not-allowed opacity-60"
                }`}
              >
                {submitting
                  ? "Saving..."
                  : mode === "create"
                  ? "Submit Intake"
                  : "Save Changes"}
              </button>
            )}

            {mode === "view" && (
              <div className="text-sm opacity-70">
                Click <span className="font-semibold">Edit</span> to modify, or{" "}
                <span className="font-semibold">Delete</span> to remove.
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
