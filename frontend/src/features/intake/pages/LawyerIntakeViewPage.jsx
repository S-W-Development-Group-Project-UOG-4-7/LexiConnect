// frontend/src/features/intake/pages/LawyerIntakeViewPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteIntakeByBooking,
  getIntakeByBooking,
  updateIntakeByBooking,
} from "../services/intake.service";

export default function LawyerIntakeViewPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // editable fields
  const [caseType, setCaseType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [answersJsonText, setAnswersJsonText] = useState("{}");

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setErr("");
      setEditMode(false);

      try {
        const res = await getIntakeByBooking(bookingId);
        if (!mounted) return;

        const d = res.data;
        setData(d);

        // load form state
        setCaseType(d?.case_type ?? "");
        setUrgency(d?.urgency ?? "");
        setSubject(d?.subject ?? "");
        setDetails(d?.details ?? "");
        setAnswersJsonText(JSON.stringify(d?.answers_json ?? {}, null, 2));
      } catch (e) {
        if (!mounted) return;

        // If API returns 404, treat as "not submitted"
        if (e?.response?.status === 404) {
          setData(null);
        } else {
          const msg =
            e?.response?.data?.detail ||
            e?.response?.data?.message ||
            "Failed to load intake form";
          setErr(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [bookingId]);

  const createdAt = useMemo(() => formatDate(data?.created_at), [data]);
  const updatedAt = useMemo(() => formatDate(data?.updated_at), [data]);

  function resetEditsFromData() {
    setCaseType(data?.case_type ?? "");
    setUrgency(data?.urgency ?? "");
    setSubject(data?.subject ?? "");
    setDetails(data?.details ?? "");
    setAnswersJsonText(JSON.stringify(data?.answers_json ?? {}, null, 2));
  }

  async function onSave() {
    setErr("");

    // validate JSON
    let parsedAnswers = {};
    try {
      parsedAnswers = answersJsonText?.trim()
        ? JSON.parse(answersJsonText)
        : {};
      if (parsedAnswers && typeof parsedAnswers !== "object") {
        setErr("Answers JSON must be a JSON object (e.g. { \"key\": \"value\" }).");
        return;
      }
    } catch {
      setErr("Answers JSON is invalid. Fix it before saving.");
      return;
    }

    // minimal validation
    if (!subject.trim() || subject.trim().length < 3) {
      setErr("Subject must be at least 3 characters.");
      return;
    }
    if (!details.trim() || details.trim().length < 10) {
      setErr("Details must be at least 10 characters.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        case_type: caseType,
        urgency,
        subject: subject.trim(),
        details: details.trim(),
        answers_json: parsedAnswers,
      };

      const res = await updateIntakeByBooking(bookingId, payload);

      // update local state with returned object if backend returns it
      const updated = res?.data ?? { ...data, ...payload };
      setData(updated);
      setEditMode(false);

      // keep form state in sync
      setCaseType(updated?.case_type ?? caseType);
      setUrgency(updated?.urgency ?? urgency);
      setSubject(updated?.subject ?? subject);
      setDetails(updated?.details ?? details);
      setAnswersJsonText(JSON.stringify(updated?.answers_json ?? parsedAnswers, null, 2));
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to save intake form";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setErr("");

    const ok = window.confirm(
      `Delete intake form for booking #${bookingId}? This cannot be undone.`
    );
    if (!ok) return;

    try {
      setDeleting(true);
      await deleteIntakeByBooking(bookingId);

      // after delete, go back to bookings hub or lawyer dashboard
      navigate(-1);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to delete intake form";
      setErr(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen p-6 text-white bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Intake Form</h1>
            <div className="text-sm opacity-80 mt-1">
              Booking <span className="font-semibold">#{bookingId}</span>
            </div>
          </div>

          <Link
            to="/lawyer/dashboard"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
          >
            Back
          </Link>
        </div>

        {loading && (
          <div className="rounded border border-slate-700 bg-slate-900/60 p-4 opacity-80">
            Loading intake...
          </div>
        )}

        {!loading && err && (
          <div className="rounded border border-red-700 bg-red-900/40 p-4 mb-4">
            <div className="font-semibold mb-1">Issue</div>
            <div className="opacity-90">{err}</div>
          </div>
        )}

        {!loading && !err && !data && (
          <div className="rounded border border-slate-700 bg-slate-900/60 p-4 opacity-80">
            No intake submitted yet.
          </div>
        )}

        {!loading && data && (
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
            {/* Header actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
              <div className="text-sm opacity-80">
                <div>
                  <span className="opacity-70">Client ID:</span>{" "}
                  <span className="font-semibold">{data.client_id ?? "—"}</span>
                </div>
                <div className="mt-1">
                  <span className="opacity-70">Created:</span>{" "}
                  <span className="font-semibold">{createdAt}</span>{" "}
                  <span className="opacity-70 ml-3">Updated:</span>{" "}
                  <span className="font-semibold">{updatedAt}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {!editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={onDelete}
                      disabled={deleting}
                      className={`px-4 py-2 rounded text-sm font-semibold ${
                        deleting
                          ? "bg-slate-700 opacity-60 cursor-not-allowed"
                          : "bg-rose-600 hover:bg-rose-700"
                      }`}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onSave}
                      disabled={saving}
                      className={`px-4 py-2 rounded text-sm font-semibold ${
                        saving
                          ? "bg-slate-700 opacity-60 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        resetEditsFromData();
                        setEditMode(false);
                        setErr("");
                      }}
                      disabled={saving}
                      className="px-4 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Case Type"
                value={caseType}
                setValue={setCaseType}
                readOnly={!editMode}
                placeholder="Case type"
              />
              <Field
                label="Urgency"
                value={urgency}
                setValue={setUrgency}
                readOnly={!editMode}
                placeholder="Urgency"
              />
            </div>

            <div className="mt-4">
              <Field
                label="Subject"
                value={subject}
                setValue={setSubject}
                readOnly={!editMode}
                placeholder="Subject"
              />
            </div>

            <div className="mt-4">
              <TextArea
                label="Details"
                value={details}
                setValue={setDetails}
                readOnly={!editMode}
                placeholder="Details"
              />
            </div>

            <div className="mt-4 rounded border border-slate-700 bg-slate-950/30 p-4">
              <div className="font-semibold mb-2">Answers JSON</div>
              {editMode ? (
                <textarea
                  value={answersJsonText}
                  onChange={(e) => setAnswersJsonText(e.target.value)}
                  rows={8}
                  className="w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-xs font-mono"
                />
              ) : (
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(data.answers_json ?? {}, null, 2)}
                </pre>
              )}
              {editMode && (
                <div className="text-xs opacity-70 mt-2">
                  Must be valid JSON object (example: {"{ \"NIC\": \"123...\" }"}).
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, setValue, readOnly, placeholder }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-950/30 p-4">
      <div className="text-xs opacity-70">{label}</div>
      {readOnly ? (
        <div className="mt-1 font-semibold break-words">{value || "—"}</div>
      ) : (
        <input
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2"
        />
      )}
    </div>
  );
}

function TextArea({ label, value, setValue, readOnly, placeholder }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-950/30 p-4">
      <div className="text-xs opacity-70">{label}</div>
      {readOnly ? (
        <div className="mt-2 whitespace-pre-wrap leading-relaxed">
          {value || "—"}
        </div>
      ) : (
        <textarea
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="mt-2 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2"
        />
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
}
