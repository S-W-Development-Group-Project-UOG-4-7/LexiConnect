import { useEffect, useMemo, useState } from "react";
import {
  assignApprenticeToCase,
  fetchCaseNotesForLawyer,
  fetchApprenticeChoices,
  fetchCaseChoices,
} from "../api/apprenticeshipApi";

export default function LawyerApprenticesPage() {
  // Dropdown data
  const [apprentices, setApprentices] = useState([]);
  const [cases, setCases] = useState([]);
  const [choicesLoading, setChoicesLoading] = useState(true);
  const [choicesErr, setChoicesErr] = useState("");

  // Assign
  const [apprenticeId, setApprenticeId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  // Notes viewer
  const [notesCaseId, setNotesCaseId] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesErr, setNotesErr] = useState("");
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    (async () => {
      setChoicesLoading(true);
      setChoicesErr("");
      try {
        const [appr, cs] = await Promise.all([
          fetchApprenticeChoices(),
          fetchCaseChoices(),
        ]);
        setApprentices(Array.isArray(appr) ? appr : []);
        setCases(Array.isArray(cs) ? cs : []);
      } catch (e) {
        setChoicesErr(
          e?.response?.data?.detail ||
            "Failed to load dropdown choices (apprentices/cases)."
        );
      } finally {
        setChoicesLoading(false);
      }
    })();
  }, []);

  const apprenticeLabel = (a) => {
    const name = a?.full_name ?? `Apprentice #${a?.id}`;
    const email = a?.email ? ` (${a.email})` : "";
    return `${name}${email}`;
  };

  const caseLabel = (c) => {
    const title = c?.title ?? `Case #${c?.id}`;
    const district = c?.district ? ` • ${c.district}` : "";
    const category = c?.category ? ` • ${c.category}` : "";
    const status = c?.status ? ` • ${c.status}` : "";
    return `${title}${district}${category}${status}`;
  };

  const selectedCaseForNotes = useMemo(() => {
    const idNum = Number(notesCaseId);
    if (!Number.isFinite(idNum)) return null;
    return cases.find((c) => Number(c.id) === idNum) || null;
  }, [notesCaseId, cases]);

  const handleAssign = async () => {
    setOk("");
    setErr("");
    setAssignLoading(true);

    try {
      await assignApprenticeToCase({
        case_id: Number(caseId),
        apprentice_id: Number(apprenticeId),
      });
      setOk("Apprentice assigned successfully.");
      setApprenticeId("");
      setCaseId("");

      // Optional: refresh cases list (if assignment affects what you want to view later)
      // const cs = await fetchCaseChoices();
      // setCases(Array.isArray(cs) ? cs : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to assign apprentice.");
    } finally {
      setAssignLoading(false);
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

      {/* Dropdown load status */}
      {choicesErr && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {choicesErr}
        </div>
      )}

      {/* Assign */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-semibold">Assign apprentice to case</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <label className="text-sm text-slate-200">
            Apprentice
            <select
              className="mt-2 w-full rounded-lg bg-slate-950/30 border border-slate-700/60 px-4 py-3 text-white outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30"
              value={apprenticeId}
              onChange={(e) => setApprenticeId(e.target.value)}
              disabled={choicesLoading}
            >
              <option value="">
                {choicesLoading ? "Loading apprentices..." : "Select an apprentice"}
              </option>
              {apprentices.map((a) => (
                <option key={a.id} value={a.id}>
                  {apprenticeLabel(a)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-200">
            Case
            <select
              className="mt-2 w-full rounded-lg bg-slate-950/30 border border-slate-700/60 px-4 py-3 text-white outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              disabled={choicesLoading}
            >
              <option value="">
                {choicesLoading ? "Loading cases..." : "Select a case"}
              </option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {caseLabel(c)}
                </option>
              ))}
            </select>
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
          disabled={assignLoading || !apprenticeId || !caseId || choicesLoading}
          className="mt-5 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-400 disabled:opacity-60"
        >
          {assignLoading ? "Assigning..." : "Assign Apprentice"}
        </button>
      </div>

      {/* Notes Viewer (NOW by Case Name via dropdown) */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-semibold">View notes by Case</h2>

        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <select
            className="w-full md:max-w-2xl rounded-lg bg-slate-950/30 border border-slate-700/60 px-4 py-3 text-white outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30"
            value={notesCaseId}
            onChange={(e) => setNotesCaseId(e.target.value)}
            disabled={choicesLoading}
          >
            <option value="">
              {choicesLoading ? "Loading cases..." : "Select a case to view notes"}
            </option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {caseLabel(c)}
              </option>
            ))}
          </select>

          <button
            onClick={handleLoadNotes}
            disabled={notesLoading || !notesCaseId || choicesLoading}
            className="rounded-lg bg-slate-800 border border-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {notesLoading ? "Loading..." : "Load Notes"}
          </button>
        </div>

        {selectedCaseForNotes && (
          <div className="mt-3 text-slate-300 text-sm">
            Selected: <span className="text-white">{selectedCaseForNotes.title}</span>
            {selectedCaseForNotes.district ? (
              <> • <span className="text-slate-200">{selectedCaseForNotes.district}</span></>
            ) : null}
          </div>
        )}

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
