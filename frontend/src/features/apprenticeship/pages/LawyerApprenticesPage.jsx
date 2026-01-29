import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  assignApprenticeToCase,
  fetchCaseNotesForLawyer,
  fetchLawyerCases,
  searchApprentices,
} from "../api/apprenticeshipApi";

export default function LawyerApprenticesPage() {
  const location = useLocation();

  const initialTab = useMemo(() => {
    const t = location?.state?.tab;
    return t === "notes" ? "notes" : "assign";
  }, [location?.state?.tab]);

  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    // if navigating from dashboard with {state:{tab:"notes"}}, reflect it
    setTab(initialTab);
  }, [initialTab]);

  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesErr, setCasesErr] = useState("");

  // Assign
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [apprenticeQuery, setApprenticeQuery] = useState("");
  const [apprenticeResults, setApprenticeResults] = useState([]);
  const [apprenticeLoading, setApprenticeLoading] = useState(false);
  const [selectedApprentice, setSelectedApprentice] = useState(null);
  const [showApprenticeResults, setShowApprenticeResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  // Notes viewer
  const [notesCaseId, setNotesCaseId] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesErr, setNotesErr] = useState("");
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadCases = async () => {
      setCasesLoading(true);
      setCasesErr("");
      try {
        const data = await fetchLawyerCases();
        if (mounted) {
          setCases(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (mounted) {
          setCasesErr(e?.response?.data?.detail || "Failed to load cases.");
        }
      } finally {
        if (mounted) {
          setCasesLoading(false);
        }
      }
    };
    loadCases();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const q = apprenticeQuery.trim();
    if (!q) {
      setApprenticeResults([]);
      setShowApprenticeResults(false);
      return;
    }

    let active = true;
    const handle = setTimeout(async () => {
      setApprenticeLoading(true);
      try {
        const data = await searchApprentices(q);
        if (active) {
          setApprenticeResults(Array.isArray(data) ? data : []);
          setShowApprenticeResults(true);
        }
      } catch (e) {
        if (active) {
          setApprenticeResults([]);
          setShowApprenticeResults(true);
        }
      } finally {
        if (active) {
          setApprenticeLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [apprenticeQuery]);

  const handleAssign = async () => {
    setOk("");
    setErr("");
    setLoading(true);
    try {
      await assignApprenticeToCase({
        case_id: Number(selectedCaseId),
        apprentice_id: Number(selectedApprentice?.id),
      });
      setOk("Apprentice assigned successfully.");
      setSelectedApprentice(null);
      setApprenticeQuery("");
      setSelectedCaseId("");
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

        {/* Tabs */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setTab("assign")}
            className={[
              "px-4 py-2 rounded-lg border text-sm font-semibold",
              tab === "assign"
                ? "bg-amber-500 text-white border-amber-400/50"
                : "bg-slate-950/30 text-slate-200 border-slate-700/60 hover:bg-slate-800/40",
            ].join(" ")}
          >
            Assign
          </button>
          <button
            onClick={() => setTab("notes")}
            className={[
              "px-4 py-2 rounded-lg border text-sm font-semibold",
              tab === "notes"
                ? "bg-amber-500 text-white border-amber-400/50"
                : "bg-slate-950/30 text-slate-200 border-slate-700/60 hover:bg-slate-800/40",
            ].join(" ")}
          >
            Notes
          </button>
        </div>
      </div>

      {/* Assign */}
      {tab === "assign" && (
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-semibold">Assign apprentice to case</h2>
          <p className="text-slate-300 text-sm mt-1">
            Select a case and search for an apprentice to assign.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <label className="text-sm text-slate-200">
              Case
              <select
                className="mt-2 w-full rounded-lg bg-slate-950/30 border border-slate-700/60 px-4 py-3 text-white outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30"
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                disabled={casesLoading}
              >
                <option value="">
                  {casesLoading ? "Loading cases..." : "Select a case"}
                </option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} - {c.title} ({c.status})
                    {c.client_name ? ` - ${c.client_name}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate-200">
              Apprentice
              <div className="relative mt-2">
                <input
                  className="w-full rounded-lg bg-slate-950/30 border border-slate-700/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30"
                  placeholder="Search by ID, name, or email"
                  value={apprenticeQuery}
                  onChange={(e) => {
                    setApprenticeQuery(e.target.value);
                    setSelectedApprentice(null);
                  }}
                  onFocus={() => {
                    if (apprenticeResults.length > 0) setShowApprenticeResults(true);
                  }}
                />
                {showApprenticeResults && (
                  <div className="absolute z-20 mt-2 w-full rounded-lg border border-slate-700/60 bg-slate-950/95 shadow-lg">
                    {apprenticeLoading && (
                      <div className="px-4 py-3 text-sm text-slate-300">
                        Searching...
                      </div>
                    )}
                    {!apprenticeLoading && apprenticeResults.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-300">
                        No apprentices found.
                      </div>
                    )}
                    {!apprenticeLoading &&
                      apprenticeResults.map((apprentice) => (
                        <button
                          key={apprentice.id}
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm text-white hover:bg-slate-800/60"
                          onClick={() => {
                            setSelectedApprentice(apprentice);
                            setApprenticeQuery(`${apprentice.full_name} (${apprentice.email})`);
                            setShowApprenticeResults(false);
                          }}
                        >
                          <div className="font-semibold">
                            #{apprentice.id} - {apprentice.full_name}
                          </div>
                          <div className="text-xs text-slate-400">{apprentice.email}</div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </label>
          </div>

          {casesErr && (
            <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {casesErr}
            </div>
          )}

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

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleAssign}
              disabled={loading || !selectedApprentice?.id || !selectedCaseId}
              className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-400 disabled:opacity-60"
            >
              {loading ? "Assigning..." : "Assign Apprentice"}
            </button>

            <button
              onClick={() => {
                setSelectedApprentice(null);
                setApprenticeQuery("");
                setSelectedCaseId("");
                setErr("");
                setOk("");
              }}
              className="rounded-lg bg-slate-800 border border-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Notes */}
      {tab === "notes" && (
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-semibold">View notes by Case ID</h2>
          <p className="text-slate-300 text-sm mt-1">
            Notes are visible only to lawyers and apprentices (not clients).
          </p>

          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <select
              className="w-full md:max-w-xs rounded-lg bg-slate-950/30 border border-slate-700/60 px-4 py-3 text-white outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30"
              value={notesCaseId}
              onChange={(e) => setNotesCaseId(e.target.value)}
              disabled={casesLoading}
            >
              <option value="">
                {casesLoading ? "Loading cases..." : "Select a case"}
              </option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} - {c.title} ({c.status})
                  {c.client_name ? ` - ${c.client_name}` : ""}
                </option>
              ))}
            </select>
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
                      {apprentice ? ` Apprentice #${apprentice}` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
