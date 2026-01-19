import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  addApprenticeCaseNote,
  fetchApprenticeCaseNotes,
  fetchMyApprenticeCases,
} from "../api/apprenticeshipApi";

const normalizeCase = (c) => {
  const caseId = c.case_id ?? c.caseId ?? c.id;
  return {
    caseId,
    title: c.title ?? c.subject ?? c.case_title ?? `Case #${caseId}`,
    category: c.category ?? c.case_category ?? "—",
    supervisingLawyer: c.supervising_lawyer ?? c.lawyer_name ?? c.lawyer ?? "—",
    status: (c.status ?? "active").toLowerCase(),
    districtCity: c.district && c.city ? `${c.district} / ${c.city}` : c.district ?? c.city ?? "—",
    createdDate: c.created_at ?? c.createdAt ?? c.assigned_date ?? "—",
  };
};

const normalizeNote = (n) => {
  return {
    id: n.id ?? `${n.created_at}-${Math.random()}`,
    text: n.note ?? n.text ?? "",
    createdAt: n.created_at ?? n.createdAt ?? "",
    author: n.author_name ?? n.author ?? "You",
  };
};

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "—") return "—";
  try {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${month} ${day}, ${year}, ${time}`;
  } catch {
    return dateStr;
  }
};

const placeholderDocs = [
  { name: "Property_Title_Deed.pdf", type: "PDF", uploaded: "1/5/2025" },
  { name: "Previous_Agreements.docx", type: "DOCX", uploaded: "1/7/2025" },
  { name: "Survey_Plan.pdf", type: "PDF", uploaded: "1/6/2025" },
  { name: "Client_ID_Copy.pdf", type: "PDF", uploaded: "1/5/2025" },
];

export default function ApprenticeCaseView() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [loadingCase, setLoadingCase] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [notesError, setNotesError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyApprenticeCases();
        const allCases = Array.isArray(data) ? data : [];
        const found = allCases.find((c) => {
          const id = c.case_id ?? c.caseId ?? c.id;
          return String(id) === String(caseId);
        });
        if (found) {
          setCaseData(normalizeCase(found));
        }
      } finally {
        setLoadingCase(false);
      }
    })();
  }, [caseId]);

  const loadNotes = async () => {
    try {
      setNotesError("");
      const data = await fetchApprenticeCaseNotes(caseId);
      setNotes((Array.isArray(data) ? data : []).map(normalizeNote));
    } catch (e) {
      if (e?.response?.status === 403) {
        setNotesError(
          "Notes view is restricted. You can still add notes below."
        );
      } else {
        setNotesError(
          e?.response?.data?.detail ||
            "Unable to load notes. You can still add notes below."
        );
      }
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
  
    const newNoteText = noteText.trim();
  
    setSaving(true);
    setSaveError("");
  
    try {
      // ✅ 1) Save note to backend
      await addApprenticeCaseNote(caseId, newNoteText);
  
      // ✅ 2) Clear textarea
      setNoteText("");
  
      // ✅ 3) Remove the restriction error message (better UX)
      setNotesError("");
  
      // ✅ 4) INSTANTLY show the note in UI even if GET is forbidden
      setNotes((prev) => [
        {
          id: "temp-" + Date.now(),
          text: newNoteText,
          createdAt: new Date().toISOString(),
          author: "You",
        },
        ...prev,
      ]);
  
      // ✅ 5) Try refresh notes (works only if backend allows GET)
      try {
        const data = await fetchApprenticeCaseNotes(caseId);
        setNotes((Array.isArray(data) ? data : []).map(normalizeNote));
      } catch {
        // ignore forbidden (403) or other errors
      }
    } catch (e) {
      setSaveError(e?.response?.data?.detail || "Failed to save note.");
    } finally {
      setSaving(false);
    }
  };
  

  if (loadingCase) {
    return (
      <div className="text-slate-300 py-12 text-center">Loading case...</div>
    );
  }

  if (!caseData) {
    return (
      <div className="space-y-4">
        <Link
          to="/apprentice/dashboard"
          className="text-amber-300 hover:underline"
        >
          ← Back to Dashboard
        </Link>
        <div className="text-red-300">Case not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Link */}
      <Link
        to="/apprentice/dashboard"
        className="text-amber-300 hover:underline inline-block"
      >
        ← Back to Dashboard
      </Link>

      {/* Case Title */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">{caseData.title}</h1>
        <p className="text-slate-400">Case ID: {caseData.caseId}</p>
      </div>

      {/* Case Summary Card */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Case Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-slate-400 text-sm mb-1">Case ID</div>
            <div className="text-white font-medium">{caseData.caseId}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Status</div>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              caseData.status === "active" || (!caseData.status.includes("closed") && !caseData.status.includes("completed"))
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
            }`}>
              {caseData.status === "active" || (!caseData.status.includes("closed") && !caseData.status.includes("completed")) ? "Active" : "Closed"}
            </span>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Category</div>
            <div className="text-white font-medium">{caseData.category}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Assigned Lawyer</div>
            <div className="text-white font-medium">{caseData.supervisingLawyer}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">District / City</div>
            <div className="text-white font-medium">{caseData.districtCity}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Created Date</div>
            <div className="text-white font-medium">{caseData.createdDate}</div>
          </div>
        </div>
      </div>

      {/* Case Documents */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Case Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {placeholderDocs.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-700/60 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-blue-400 text-2xl">📄</div>
                <div>
                  <div className="text-white font-medium">{doc.name}</div>
                  <div className="text-slate-400 text-sm">
                    {doc.type} - Uploaded {doc.uploaded}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="p-2 rounded text-slate-500 cursor-not-allowed"
                  title="View"
                >
                  👁️
                </button>
                <button
                  disabled
                  className="p-2 rounded text-slate-500 cursor-not-allowed"
                  title="Download"
                >
                  ⬇️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Apprentice Notes */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold text-white">Internal Apprentice Notes</h2>
          <span className="text-slate-400">🔒</span>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Visible only to lawyers and apprentices (not clients)
        </p>

        {notesError && (
          <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {notesError}
          </div>
        )}

        {/* Add Note Form */}
        <div className="mb-6">
          <textarea
            className="w-full min-h-[120px] rounded-lg bg-slate-950/30 border border-slate-700/60 p-4 text-white placeholder:text-slate-500 outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 resize-none"
            placeholder="Add a new note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSave}
              disabled={saving || !noteText.trim()}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Note
            </button>
          </div>
          {saveError && (
            <div className="mt-2 text-red-300 text-sm">{saveError}</div>
          )}
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {loadingNotes && (
            <div className="text-slate-300 py-4 text-center">Loading notes...</div>
          )}

          {!loadingNotes && !notesError && notes.length === 0 && (
            <div className="text-slate-400 py-4 text-center">No notes yet.</div>
          )}

          {!loadingNotes && notes.length > 0 && (
            <>
              {notes.map((n) => {
                const isYou = n.author === "You" || !n.author || n.author.toLowerCase().includes("you");
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-4 p-4 bg-slate-950/30 border border-slate-700/60 rounded-lg"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isYou ? "bg-amber-500/20" : "bg-blue-500/20"
                    }`}>
                      <span className="text-lg">
                        {isYou ? "👤" : "👨‍⚖️"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-white">{n.author || "You"}</div>
                        <div className="text-slate-400 text-sm">
                          {formatDate(n.createdAt)}
                        </div>
                      </div>
                      <div className="text-slate-300 whitespace-pre-wrap">{n.text}</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
