// frontend/src/features/intake/pages/LawyerIntakeViewPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getIntakeByBooking,
} from "../services/intake.service";

export default function LawyerIntakeViewPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Case Type"
                value={caseType}
                readOnly
                placeholder="Case type"
              />
              <Field
                label="Urgency"
                value={urgency}
                readOnly
                placeholder="Urgency"
              />
            </div>

            <div className="mt-4">
              <Field
                label="Subject"
                value={subject}
                readOnly
                placeholder="Subject"
              />
            </div>

            <div className="mt-4">
              <TextArea
                label="Details"
                value={details}
                readOnly
                placeholder="Details"
              />
            </div>

            <div className="mt-4 rounded border border-slate-700 bg-slate-950/30 p-4">
              <div className="font-semibold mb-2">Answers JSON</div>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {JSON.stringify(data.answers_json ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, readOnly, placeholder }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-950/30 p-4">
      <div className="text-xs opacity-70">{label}</div>
      <div className="mt-1 font-semibold break-words">{value || "—"}</div>
    </div>
  );
}

function TextArea({ label, value, readOnly, placeholder }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-950/30 p-4">
      <div className="text-xs opacity-70">{label}</div>
      <div className="mt-2 whitespace-pre-wrap leading-relaxed">
        {value || "—"}
      </div>
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
