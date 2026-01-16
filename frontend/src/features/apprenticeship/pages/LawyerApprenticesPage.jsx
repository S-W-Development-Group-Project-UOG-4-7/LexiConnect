import { useState } from "react";
import { assignApprenticeToCase, fetchCaseNotesForLawyer } from "../api/apprenticeshipApi";

export default function LawyerApprenticesPage() {
  // Assign
  const [apprenticeId, setApprenticeId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  // Notes viewer
  const [notesCaseId, setNotesCaseId] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesErr, setNotesErr] = useState("");
  const [notes, setNotes] = useState([]);

  const handleAssign = async () => {
    setOk("");
    setErr("");
    setLoading(true);
    try {
      await assignApprenticeToCase({
        case_id: Number(caseId),
        apprentice_id: Number(apprenticeId),
      });
      setOk("Apprentice assigned successfully.");
      setApprenticeId("");
      setCaseId("");
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to assign apprentice.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadNotes = async () => {
    if (!notesCaseId) return;
    setNotesErr("");
    setNotes([]);
    setNotesLoading(true);
    try {
      const data = await fetchCaseNotesForLawyer(Number(notesCaseId));
      setNotes(Array.isArray(data) ? data : []);
    } catch (e) {
      setNotesErr(e?.response?.data?.detail || "Failed to load notes.");
    } finally {
      setNotesLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">Apprenticeship</h1>
        <p className="text-slate-300 mt-2">
          Assign apprentices to cases and review internal notes.
        </p>
      </div>

      {/* Assign */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-semibold">Assign apprentice to case</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <label className="text-sm text-slate-200">
            Apprentice ID
            <input
              className="mt-2 w-full rounded-lg bg-slate-950/30 border border-slate-700/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30"
              placeholder="e.g. 4"
              value={apprenticeId}
              onChange={(e) => setApprenticeId(e.target.value)}
            />
          </label>

          <label className="text-sm text-slate-200">
            Case ID
            <input
              className="mt-2 w-full rounded-lg bg-slate-950/30 border border-slate-700/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30"
              placeholder="e.g. 1"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            />
          </label>
        </div>

        {ok && (
          <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {ok}
          </div>
        )}

        {err && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}

        <button
          onClick={handleAssign}
          disabled={loading || !apprenticeId || !caseId}
          className="mt-5 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-400 disabled:opacity-60"
        >
          {loading ? "Assigning..." : "Assign Apprentice"}
        </button>
      </div>

      {/* Notes Viewer (keep as-is) */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-semibold">View notes by Case ID</h2>

        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <input
            className="w-full md:max-w-xs rounded-lg bg-slate-950/30 border border-slate-700/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30"
            placeholder="Case ID (e.g. 4)"
            value={notesCaseId}
            onChange={(e) => setNotesCaseId(e.target.value)}
          />
          <button
            onClick={handleLoadNotes}
            disabled={notesLoading || !notesCaseId}
            className="rounded-lg bg-slate-800 border border-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {notesLoading ? "Loading..." : "Load Notes"}
          </button>
        </div>

        {notesErr && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {notesErr}
          </div>
        )}

        {!notesLoading && !notesErr && notesCaseId && notes.length === 0 && (
          <div className="mt-4 text-slate-300">No notes found.</div>
        )}

        {!notesLoading && notes.length > 0 && (
          <div className="mt-5 space-y-3">
            {notes.map((n) => {
              const id = n.id ?? `${n.created_at}-${Math.random()}`;
              const text = n.text ?? n.note ?? "";
              const ts = n.created_at ?? n.createdAt ?? "";
              const apprentice = n.apprentice_id ?? n.apprenticeId ?? null;

              return (
                <div
                  key={id}
                  className="rounded-xl border border-slate-700/60 bg-slate-950/30 p-4"
                >
                  <div className="text-slate-200">{text}</div>
                  <div className="text-slate-500 text-xs mt-2">
                    {ts ? ts : ""}
                    {apprentice ? ` • Apprentice #${apprentice}` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
