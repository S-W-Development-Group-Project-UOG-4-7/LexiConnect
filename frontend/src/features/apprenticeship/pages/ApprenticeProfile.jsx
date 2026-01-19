import { useEffect, useState } from "react";
import { getUserFromToken } from "../../../services/auth";
import { fetchMyApprenticeCases, fetchApprenticeCaseNotes } from "../api/apprenticeshipApi";

export default function ApprenticeProfile() {
  const [cases, setCases] = useState([]);
  const [notesCount, setNotesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyApprenticeCases();
        const allCases = Array.isArray(data) ? data : [];
        setCases(allCases);

        // Try to count notes (lightweight - just first 5 cases)
        let totalNotes = 0;
        for (const c of allCases.slice(0, 5)) {
          try {
            const caseId = c.case_id ?? c.id ?? c.caseId;
            const notes = await fetchApprenticeCaseNotes(caseId);
            if (Array.isArray(notes)) {
              totalNotes += notes.length;
            }
          } catch {
            // ignore
          }
        }
        setNotesCount(totalNotes);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const user = getUserFromToken();
  const email = user?.email ?? localStorage.getItem("email") ?? "apprentice@lexiconnect.local";
  const name = user?.name ?? user?.full_name ?? "Apprentice";
  const memberSince = user?.created_at ?? "—";

  const activeCases = cases.filter(
    (c) => {
      const status = (c.status ?? "active").toLowerCase();
      return status !== "closed" && status !== "completed";
    }
  ).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
        <p className="text-slate-300">Manage your apprentice account</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{name}</h2>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium">
                Apprentice
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <span>📧</span>
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>📅</span>
              <span>Joined {memberSince === "—" ? "September 2024" : (() => {
                try {
                  const date = new Date(memberSince);
                  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                } catch {
                  return "September 2024";
                }
              })()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-slate-400 text-sm mb-1">Full Name</div>
            <div className="text-white font-medium">{name}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Email Address</div>
            <div className="text-white font-medium">{email}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Role</div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium">
              Apprentice
            </span>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Member Since</div>
            <div className="text-white font-medium">
              {memberSince === "—" ? "9/1/2024" : (() => {
                try {
                  const date = new Date(memberSince);
                  return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
                } catch {
                  return "9/1/2024";
                }
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Supervising Lawyers */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Supervising Lawyers</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-950/30 border border-slate-700/60 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-xl">👨‍⚖️</span>
            </div>
            <div className="text-white font-medium">Ayesha Perera</div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-950/30 border border-slate-700/60 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-xl">👨‍⚖️</span>
            </div>
            <div className="text-white font-medium">Nimal Fernando</div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/30 border border-slate-700/60 rounded-lg p-5 text-center">
            <div className="text-amber-300 text-3xl mb-2">⚖️</div>
            <div className="text-3xl font-bold text-white mb-1">
              {loading ? "—" : cases.length}
            </div>
            <div className="text-slate-400 text-sm">Total Cases Handled</div>
          </div>
          <div className="bg-slate-950/30 border border-slate-700/60 rounded-lg p-5 text-center">
            <div className="text-blue-400 text-3xl mb-2">⚖️</div>
            <div className="text-3xl font-bold text-white mb-1">
              {loading ? "—" : activeCases}
            </div>
            <div className="text-slate-400 text-sm">Active Cases</div>
          </div>
          <div className="bg-slate-950/30 border border-slate-700/60 rounded-lg p-5 text-center">
            <div className="text-purple-400 text-3xl mb-2">📝</div>
            <div className="text-3xl font-bold text-white mb-1">
              {loading ? "—" : notesCount}
            </div>
            <div className="text-slate-400 text-sm">Notes Contributed</div>
          </div>
        </div>
      </div>

      {/* Apprentice Role */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-amber-300 text-2xl">👤</span>
          <h2 className="text-xl font-semibold text-white">Apprentice Role</h2>
        </div>
        <p className="text-slate-300 mb-4">
          As an apprentice, you work closely with supervising lawyers to assist with case management, research, and documentation. Your notes and contributions are visible to lawyers but remain internal and are not shared with clients.
        </p>
        <ul className="space-y-2 text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-amber-300 mt-1">•</span>
            <span>View and manage assigned cases</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-300 mt-1">•</span>
            <span>Add internal notes for case documentation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-300 mt-1">•</span>
            <span>Access case documents and client information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-300 mt-1">•</span>
            <span>Collaborate with supervising lawyers</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
