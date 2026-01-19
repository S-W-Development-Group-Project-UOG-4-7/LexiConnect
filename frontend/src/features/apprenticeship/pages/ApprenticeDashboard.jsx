import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchMyApprenticeCases, fetchApprenticeCaseNotes } from "../api/apprenticeshipApi";

const normalizeCase = (c) => {
  const caseId = c.case_id ?? c.caseId ?? c.case?.id ?? c.id;
  return {
    caseId,
    title: c.title ?? c.subject ?? c.case_title ?? `Case #${caseId}`,
    category: c.category ?? c.case_category ?? "—",
    supervisingLawyer: c.supervising_lawyer ?? c.lawyer_name ?? c.lawyer ?? "—",
    status: (c.status ?? "active").toLowerCase(),
    districtCity: c.district && c.city ? `${c.district} / ${c.city}` : c.district ?? c.city ?? "—",
    createdDate: c.created_at ?? c.createdAt ?? c.assigned_date ?? "—",
    assignedDate: c.assigned_date ?? c.assignedAt ?? c.created_at ?? "—",
  };
};

export default function ApprenticeDashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesCount, setNotesCount] = useState(0);
  const [lastActivity, setLastActivity] = useState("—");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyApprenticeCases();
        const normalized = (Array.isArray(data) ? data : []).map(normalizeCase);
        setCases(normalized);

        // Try to fetch notes counts (lightweight approach - just try first 3 cases)
        let totalNotes = 0;
        let latestTs = null;
        for (const c of normalized.slice(0, 3)) {
          try {
            const notes = await fetchApprenticeCaseNotes(c.caseId);
            if (Array.isArray(notes) && notes.length > 0) {
              totalNotes += notes.length;
              for (const n of notes) {
                const ts = n.created_at ?? n.createdAt;
                if (ts && (!latestTs || ts > latestTs)) latestTs = ts;
              }
            }
          } catch {
            // ignore forbidden/errors
          }
        }
        setNotesCount(totalNotes);
        if (latestTs) {
          try {
            const date = new Date(latestTs);
            const now = new Date();
            const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
            if (diffHours < 1) setLastActivity("Just now");
            else if (diffHours < 24) setLastActivity(`${diffHours}h ago`);
            else {
              const diffDays = Math.floor(diffHours / 24);
              setLastActivity(`${diffDays}d ago`);
            }
          } catch {
            setLastActivity("—");
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const total = cases.length;
    const active = cases.filter((c) => c.status !== "closed" && c.status !== "completed").length;
    return { total, active, notes: notesCount, lastActivity };
  }, [cases, notesCount, lastActivity]);

  const preview = cases.slice(0, 3);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Apprentice Dashboard</h1>
          <p className="text-slate-300 mb-1">Cases assigned by supervising lawyers</p>
          <p className="text-slate-400 text-sm">You are assisting lawyers internally. Clients cannot see your notes.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium">
          Apprentice Access
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-5">
          <div className="text-amber-300 text-2xl mb-2">⚖️</div>
          <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-slate-400 text-sm">Total Assigned Cases</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-5">
          <div className="text-blue-400 text-2xl mb-2">📊</div>
          <div className="text-3xl font-bold text-white mb-1">{stats.active}</div>
          <div className="text-slate-400 text-sm">Active Cases</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-5">
          <div className="text-purple-400 text-2xl mb-2">📝</div>
          <div className="text-3xl font-bold text-white mb-1">{stats.notes}</div>
          <div className="text-slate-400 text-sm">Notes Added</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-5">
          <div className="text-green-400 text-2xl mb-2">🕐</div>
          <div className="text-3xl font-bold text-white mb-1">{stats.lastActivity}</div>
          <div className="text-slate-400 text-sm">Last Activity</div>
        </div>
      </div>

      {/* Assigned Cases Preview */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Assigned Cases</h2>
          <Link to="/apprentice/cases" className="text-amber-300 text-sm hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="text-slate-300 py-8 text-center">Loading...</div>
        ) : preview.length === 0 ? (
          <div className="text-slate-300 py-8 text-center">No cases assigned yet.</div>
        ) : (
          <div className="space-y-4">
            {preview.map((c) => (
              <div
                key={c.caseId}
                className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-700/60 rounded-lg hover:bg-slate-900/40 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-amber-300 text-2xl">⚖️</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{c.title}</div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>Case ID: {c.caseId}</div>
                      <div className="flex items-center gap-4">
                        <span>Category: {c.category}</span>
                        <span>Supervising Lawyer: {c.supervisingLawyer}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === "active" || !c.status.includes("closed") || !c.status.includes("completed")
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                        }`}>
                          {c.status === "active" || (!c.status.includes("closed") && !c.status.includes("completed")) ? "Active" : "Closed"}
                        </span>
                      </div>
                      <div>Assigned Date: {c.assignedDate}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/apprentice/cases/${c.caseId}`)}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-medium text-sm"
                >
                  View Case
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
