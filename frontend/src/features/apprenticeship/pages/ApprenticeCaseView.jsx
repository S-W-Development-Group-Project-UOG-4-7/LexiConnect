import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addApprenticeCaseNote,
  fetchApprenticeCaseNotes,
} from "../api/apprenticeshipApi";

export default function ApprenticeCaseView() {
  const { caseId } = useParams();

  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [notesError, setNotesError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadNotes = async () => {
    try {
      setNotesError("");
      const data = await fetchApprenticeCaseNotes(caseId);
      setNotes(Array.isArray(data) ? data : []);
    } catch (e) {
      setNotesError(
        e?.response?.data?.detail ||
          "Notes view is restricted. You can still add notes below."
      );
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    setLoadingNotes(true);
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const handleSave = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await addApprenticeCaseNote(caseId, noteText.trim());
      setNoteText("");

      // Try refresh notes if allowed
      try {
        const data = await fetchApprenticeCaseNotes(caseId);
        setNotes(Array.isArray(data) ? data : []);
        setNotesError("");
      } catch {
        // ignore if forbidden
      }
    } catch (e) {
      setSaveError(e?.response?.data?.detail || "Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-8 text-white flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case #{caseId}</h1>
          <p className="text-slate-300 mt-2">
            Add internal notes for the lawyer (client cannot see).
          </p>
        </div>

        <Link to="/apprentice/cases" className="text-amber-300 text-sm">
          ← Back to cases
        </Link>
      </div>

      {notesError && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {notesError}
        </div>
      )}

      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-semibold">Notes</h2>
        <div className="mt-4">
          {loadingNotes && <div className="text-slate-300">Loading...</div>}

          {!loadingNotes && !notesError && notes.length === 0 && (
            <div className="text-slate-300">No notes yet.</div>
          )}

          {!loadingNotes && !notesError && notes.length > 0 && (
            <div className="space-y-3">
              {notes.map((n) => {
                const id = n.id ?? `${n.created_at}-${Math.random()}`;
                const text = n.text ?? n.note ?? "";
                const ts = n.created_at ?? n.createdAt ?? "";
                return (
                  <div
                    key={id}
                    className="rounded-xl border border-slate-700/60 bg-slate-950/30 p-4"
                  >
                    <div className="text-slate-200">{text}</div>
                    {ts && (
                      <div className="text-slate-500 text-xs mt-2">{ts}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-semibold">Add a note</h2>

        <textarea
          className="mt-4 w-full min-h-[120px] rounded-xl bg-slate-950/30 border border-slate-700/60 p-4 text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30"
          placeholder="Write internal note..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />

        {saveError && (
          <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {saveError}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !noteText.trim()}
          className="mt-4 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-400 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>
    </div>
  );
}
