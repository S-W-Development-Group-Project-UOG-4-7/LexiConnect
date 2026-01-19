import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyApprenticeCases } from "../api/apprenticeshipApi";

const normalizeCase = (c) => {
  const caseId = c.case_id ?? c.id ?? c.caseId;
  return {
    caseId,
    title: c.title ?? c.subject ?? c.case_title ?? `Case #${caseId}`,
    category: c.category ?? c.case_category ?? "—",
    supervisingLawyer: c.supervising_lawyer ?? c.lawyer_name ?? c.lawyer ?? "—",
    status: (c.status ?? "active").toLowerCase(),
    assignedDate: c.assigned_date ?? c.assignedAt ?? c.created_at ?? "—",
  };
};

export default function ApprenticeCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await fetchMyApprenticeCases();
        const normalized = (Array.isArray(data) ? data : []).map(normalizeCase);
        setCases(normalized);
      } catch (e) {
        setErr(
          e?.response?.data?.detail ||
            "Failed to load assigned cases. Are you logged in as apprentice?"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredCases = useMemo(() => {
    let filtered = [...cases];

    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter(
        (c) => c.status !== "closed" && c.status !== "completed"
      );
    } else if (activeTab === "completed") {
      filtered = filtered.filter(
        (c) => c.status === "closed" || c.status === "completed"
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
        String(c.caseId).toLowerCase().includes(query) ||
          c.supervisingLawyer.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [cases, activeTab, searchQuery]);

  const tabCounts = useMemo(() => {
    const all = cases.length;
    const active = cases.filter(
      (c) => c.status !== "closed" && c.status !== "completed"
    ).length;
    const completed = cases.filter(
      (c) => c.status === "closed" || c.status === "completed"
    ).length;
    return { all, active, completed };
  }, [cases]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">My Assigned Cases</h1>
        <p className="text-slate-300">Manage and track all cases assigned to you by supervising lawyers.</p>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search cases by title, client, or case ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-slate-900/40 border border-slate-700/60 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/70"
        />
        <button className="px-4 py-2 rounded-lg bg-slate-900/40 border border-slate-700/60 text-white hover:bg-slate-800/40 transition">
          <span className="mr-2">🔍</span>
          Filter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-700/60">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "all"
              ? "text-amber-300 border-b-2 border-amber-300"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All Cases ({tabCounts.all})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "active"
              ? "text-amber-300 border-b-2 border-amber-300"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Active ({tabCounts.active})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "completed"
              ? "text-amber-300 border-b-2 border-amber-300"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Completed ({tabCounts.completed})
        </button>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {loading && (
          <div className="text-slate-300 py-12 text-center">Loading...</div>
        )}

        {!loading && err && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}

        {!loading && !err && filteredCases.length === 0 && (
          <div className="text-slate-300 py-12 text-center">
            {searchQuery ? "No cases match your search." : "No cases assigned yet."}
          </div>
        )}

        {!loading && !err && filteredCases.length > 0 && (
          <>
            {filteredCases.map((c) => (
              <div
                key={c.caseId}
                className="flex items-center justify-between p-5 bg-slate-900/40 border border-slate-700/60 rounded-xl hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-amber-300 text-3xl">💼</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-lg mb-2">{c.title}</div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>Case ID: {c.caseId}</div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span>Category: {c.category}</span>
                        <span>Supervising Lawyer: {c.supervisingLawyer}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.status === "active" || (!c.status.includes("closed") && !c.status.includes("completed"))
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                        }`}>
                          {c.status === "active" || (!c.status.includes("closed") && !c.status.includes("completed")) ? "Active" : "Closed"}
                        </span>
                        <span>Assigned Date: {c.assignedDate}</span>
                      </div>
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
          </>
        )}
      </div>
    </div>
  );
}
