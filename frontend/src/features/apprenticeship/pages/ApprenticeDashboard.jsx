import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchMyApprenticeCases,
  fetchApprenticeCaseNotes,
} from "../api/apprenticeshipApi";
import PersistentToast from "../../../components/ui/PersistentToast";

const normalizeCase = (c) => {
  const caseId = c.case_id ?? c.caseId ?? c.case?.id ?? c.id;
  return {
    caseId,
    title: c.title ?? c.subject ?? c.case_title ?? `Case #${caseId}`,
    category: c.category ?? c.case_category ?? "—",
    supervisingLawyer: c.supervising_lawyer ?? c.lawyer_name ?? c.lawyer ?? "—",
    status: (c.status ?? "active").toLowerCase(),
    districtCity:
      c.district && c.city
        ? `${c.district} / ${c.city}`
        : c.district ?? c.city ?? "—",
    createdDate: c.created_at ?? c.createdAt ?? c.assigned_date ?? "—",
    assignedDate: c.assigned_date ?? c.assignedAt ?? c.created_at ?? "—",
  };
};

// -------------------- localStorage keys --------------------
const KNOWN_CASE_IDS_KEY = "apprentice_known_case_ids";
const DISMISSED_NEW_CASES_KEY = "apprentice_dismissed_new_case_ids";

// per-case last seen chat timestamp map: { [caseId]: "2026-01-31T..." }
const LAST_SEEN_CHAT_TS_KEY = "apprentice_last_seen_chat_ts";

// per-case last notified chat timestamp map: { [caseId]: "2026-01-31T..." }
const LAST_NOTIFIED_CHAT_TS_KEY = "apprentice_last_notified_chat_ts";

// unread case ids list: ["4","7",...]
const UNREAD_CASE_IDS_KEY = "apprentice_unread_case_ids";

// dismiss toast per case (optional)
const DISMISSED_NEW_MSG_CASES_KEY = "apprentice_dismissed_new_msg_case_ids";

// -------------------- helpers --------------------
const safeJsonParse = (v, fallback) => {
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};

const getLatestTsFromNotes = (notes) => {
  let latest = null;
  for (const n of notes || []) {
    const ts = n?.created_at ?? n?.createdAt ?? null;
    if (ts && (!latest || String(ts) > String(latest))) latest = ts;
  }
  return latest;
};

export default function ApprenticeDashboard() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesCount, setNotesCount] = useState(0);
  const [lastActivity, setLastActivity] = useState("—");

  // unread state for UI badges
  const [unreadIds, setUnreadIds] = useState(() =>
    safeJsonParse(localStorage.getItem(UNREAD_CASE_IDS_KEY) || "[]", [])
  );

  // ---------- NEW ASSIGNMENT TOAST ----------
  const [assignToastOpen, setAssignToastOpen] = useState(false);
  const [assignToastMsg, setAssignToastMsg] = useState("");

  // ---------- NEW MESSAGE TOAST ----------
  const [msgToastOpen, setMsgToastOpen] = useState(false);
  const [msgToastTitle] = useState("New Message");
  const [msgToastMsg, setMsgToastMsg] = useState("");
  const [msgToastCaseId, setMsgToastCaseId] = useState(null);

  // polling ref
  const pollRef = useRef(null);

  // -------------------- localStorage wrappers --------------------
  const getLastSeenMap = () =>
    safeJsonParse(localStorage.getItem(LAST_SEEN_CHAT_TS_KEY) || "{}", {});
  const setLastSeenMap = (m) =>
    localStorage.setItem(LAST_SEEN_CHAT_TS_KEY, JSON.stringify(m || {}));

  const getLastNotifiedMap = () =>
    safeJsonParse(localStorage.getItem(LAST_NOTIFIED_CHAT_TS_KEY) || "{}", {});
  const setLastNotifiedMap = (m) =>
    localStorage.setItem(LAST_NOTIFIED_CHAT_TS_KEY, JSON.stringify(m || {}));

  const getUnreadIds = () =>
    safeJsonParse(localStorage.getItem(UNREAD_CASE_IDS_KEY) || "[]", []);
  const setUnreadIdsLS = (arr) =>
    localStorage.setItem(UNREAD_CASE_IDS_KEY, JSON.stringify(arr || []));

  const getDismissedMsgCases = () =>
    safeJsonParse(localStorage.getItem(DISMISSED_NEW_MSG_CASES_KEY) || "[]", []);
  const setDismissedMsgCases = (arr) =>
    localStorage.setItem(DISMISSED_NEW_MSG_CASES_KEY, JSON.stringify(arr || []));

  // -------------------- unread mutations --------------------
  const addUnread = (caseId) => {
    const cid = String(caseId);
    const cur = getUnreadIds();
    if (!cur.includes(cid)) {
      const next = [...cur, cid];
      setUnreadIdsLS(next);
      setUnreadIds(next);
    }
  };

  // (not used inside dashboard yet, but will be used in CaseView)
  const markCaseRead = (caseId, latestTs) => {
    const cid = String(caseId);

    // 1) remove from unread list
    const cur = getUnreadIds();
    const next = cur.filter((x) => String(x) !== cid);
    setUnreadIdsLS(next);
    setUnreadIds(next);

    // 2) update last seen
    const lastSeen = getLastSeenMap();
    if (latestTs) lastSeen[cid] = latestTs;
    setLastSeenMap(lastSeen);

    // 3) also bump last notified so toast doesn't trigger for old msg
    const lastNotified = getLastNotifiedMap();
    if (latestTs) lastNotified[cid] = latestTs;
    setLastNotifiedMap(lastNotified);
  };

  // -------------------- toast --------------------
  const showNewMessageToast = (c, latestTs) => {
    const cid = String(c.caseId);

    setMsgToastMsg(`New message in: ${c.title} (Case #${cid})`);
    setMsgToastCaseId(c.caseId);
    setMsgToastOpen(true);

    // remember we already notified for this timestamp (so no spam)
    const lastNotified = getLastNotifiedMap();
    lastNotified[cid] = latestTs;
    setLastNotifiedMap(lastNotified);
  };

  // -------------------- polling logic --------------------
  // IMPORTANT: This only checks a subset to stay lightweight.
  // On dashboard we care about preview cards first.
  const checkForNewMessages = async (currentCases, options = {}) => {
    const { limit = 6 } = options;

    if (!Array.isArray(currentCases) || currentCases.length === 0) return;

    const toCheck = currentCases.slice(0, limit);

    const lastSeen = getLastSeenMap();
    const lastNotified = getLastNotifiedMap();
    const dismissedMsgCases = getDismissedMsgCases();

    for (const c of toCheck) {
      const cid = String(c.caseId);
      if (!cid) continue;

      try {
        const notes = await fetchApprenticeCaseNotes(c.caseId);
        if (!Array.isArray(notes) || notes.length === 0) continue;

        const latestTs = getLatestTsFromNotes(notes);
        if (!latestTs) continue;

        // initialize lastSeen if missing (first ever time)
        if (!lastSeen[cid]) {
          lastSeen[cid] = latestTs;
          lastNotified[cid] = latestTs;
          continue;
        }

        // unread exists if latest > lastSeen
        if (String(latestTs) > String(lastSeen[cid])) {
          addUnread(cid);

          // toast only if:
          // - user didn't dismiss for this case
          // - we haven't notified this latestTs yet
          if (
            !dismissedMsgCases.includes(cid) &&
            String(latestTs) > String(lastNotified[cid] || "")
          ) {
            showNewMessageToast(c, latestTs);
            break; // only one toast at a time
          }
        }
      } catch {
        // ignore
      }
    }

    // persist maps if we added new keys
    setLastSeenMap(lastSeen);
    setLastNotifiedMap(lastNotified);
  };

  // -------------------- Initial load --------------------
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyApprenticeCases();
        const normalized = (Array.isArray(data) ? data : []).map(normalizeCase);
        setCases(normalized);

        // ---------- NEW ASSIGNMENT TOAST ----------
        const currentIds = normalized
          .map((c) => c.caseId)
          .filter((id) => id != null)
          .map(String);

        const knownIds = safeJsonParse(
          localStorage.getItem(KNOWN_CASE_IDS_KEY) || "[]",
          []
        );
        const dismissedIds = safeJsonParse(
          localStorage.getItem(DISMISSED_NEW_CASES_KEY) || "[]",
          []
        );

        const newIds = currentIds.filter(
          (id) => !knownIds.includes(id) && !dismissedIds.includes(id)
        );

        if (newIds.length > 0) {
          const newestId = newIds[0];
          const newest = normalized.find(
            (c) => String(c.caseId) === String(newestId)
          );
          const title = newest?.title || `Case #${newestId}`;
          setAssignToastMsg(`New case assigned: ${title} (Case #${newestId})`);
          setAssignToastOpen(true);
        }

        localStorage.setItem(KNOWN_CASE_IDS_KEY, JSON.stringify(currentIds));
        // ----------------------------------------

        // ---- stats (lightweight: first 3 cases)
        let totalNotes = 0;
        let latestTs = null;

        for (const c of normalized.slice(0, 3)) {
          try {
            const notes = await fetchApprenticeCaseNotes(c.caseId);
            if (Array.isArray(notes) && notes.length > 0) {
              totalNotes += notes.length;
              const ts = getLatestTsFromNotes(notes);
              if (ts && (!latestTs || ts > latestTs)) latestTs = ts;
            }
          } catch {
            // ignore
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
            else setLastActivity(`${Math.floor(diffHours / 24)}d ago`);
          } catch {
            setLastActivity("—");
          }
        }

        // ✅ First check: prioritize preview cases (so badge matches what you see)
        await checkForNewMessages(normalized, { limit: 6 });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------- polling every 5 seconds --------------------
  useEffect(() => {
    if (!cases || cases.length === 0) return;

    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(() => {
      if (!msgToastOpen) checkForNewMessages(cases, { limit: 6 });
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, msgToastOpen]);

  const stats = useMemo(() => {
    const total = cases.length;
    const active = cases.filter((c) => {
      const s = (c.status || "").toLowerCase();
      return !s.includes("closed") && !s.includes("completed");
    }).length;
    return { total, active, notes: notesCount, lastActivity };
  }, [cases, notesCount, lastActivity]);

  const preview = cases.slice(0, 3);

  // -------------------- toast close handlers --------------------
  const handleCloseAssignToast = () => {
    const dismissedIds = safeJsonParse(
      localStorage.getItem(DISMISSED_NEW_CASES_KEY) || "[]",
      []
    );

    const match = assignToastMsg.match(/Case #(\d+)/);
    const id = match?.[1];
    if (id && !dismissedIds.includes(String(id))) {
      dismissedIds.push(String(id));
      localStorage.setItem(
        DISMISSED_NEW_CASES_KEY,
        JSON.stringify(dismissedIds)
      );
    }
    setAssignToastOpen(false);
  };

  const handleCloseMsgToast = () => {
    if (msgToastCaseId != null) {
      const cid = String(msgToastCaseId);
      const dismissed = getDismissedMsgCases();
      if (!dismissed.includes(cid)) {
        dismissed.push(cid);
        setDismissedMsgCases(dismissed);
      }
    }
    setMsgToastOpen(false);
  };

  const handleOpenMsgToast = () => {
    if (msgToastCaseId != null) {
      navigate(`/apprentice/cases/${msgToastCaseId}`);
    }
    setMsgToastOpen(false);
  };

  const isUnread = (caseId) => unreadIds.includes(String(caseId));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Persistent Notification: New Assignment */}
      <PersistentToast
        open={assignToastOpen}
        title="New Assignment"
        message={assignToastMsg}
        onClose={handleCloseAssignToast}
      />

      {/* Persistent Notification: New Message */}
      <PersistentToast
        open={msgToastOpen}
        title="New Message"
        message={msgToastMsg}
        onClose={handleCloseMsgToast}
        onClick={handleOpenMsgToast}
        actionLabel="Open chat"
        onAction={handleOpenMsgToast}
      />

      {/* Hero Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Apprentice Dashboard
          </h1>
          <p className="text-slate-300 mb-1">
            Cases assigned by supervising lawyers
          </p>
          <p className="text-slate-400 text-sm">
            You are assisting lawyers internally. Clients cannot see your notes.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium">
          Apprentice Access
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-5">
          <div className="text-amber-300 text-2xl mb-2">⚖️</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.total}
          </div>
          <div className="text-slate-400 text-sm">Total Assigned Cases</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-5">
          <div className="text-blue-400 text-2xl mb-2">📊</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.active}
          </div>
          <div className="text-slate-400 text-sm">Active Cases</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-5">
          <div className="text-purple-400 text-2xl mb-2">📝</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.notes}
          </div>
          <div className="text-slate-400 text-sm">Notes Added</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-5">
          <div className="text-green-400 text-2xl mb-2">🕐</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.lastActivity}
          </div>
          <div className="text-slate-400 text-sm">Last Activity</div>
        </div>
      </div>

      {/* Assigned Cases Preview */}
      <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Assigned Cases</h2>
          <Link
            to="/apprentice/cases"
            className="text-amber-300 text-sm hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="text-slate-300 py-8 text-center">Loading...</div>
        ) : preview.length === 0 ? (
          <div className="text-slate-300 py-8 text-center">
            No cases assigned yet.
          </div>
        ) : (
          <div className="space-y-4">
            {preview.map((c) => {
              const isActive =
                c.status === "active" ||
                (!c.status.includes("closed") &&
                  !c.status.includes("completed"));

              const unread = isUnread(c.caseId);

              return (
                <div
                  key={c.caseId}
                  className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-700/60 rounded-lg hover:bg-slate-900/40 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-amber-300 text-2xl">⚖️</div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-white mb-1">
                          {c.title}
                        </div>

                        {/* ✅ Unread Badge */}
                        {unread ? (
                          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/30">
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-300" />
                            New
                          </span>
                        ) : null}
                      </div>

                      <div className="text-sm text-slate-400 space-y-1">
                        <div>Case ID: {c.caseId}</div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span>Category: {c.category}</span>
                          <span>Supervising Lawyer: {c.supervisingLawyer}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                            }`}
                          >
                            {isActive ? "Active" : "Closed"}
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
              );
            })}
          </div>
        )}
      </div>

      {/* NOTE:
          markCaseRead() is intentionally kept here (unused) because we will use the same logic in ApprenticeCaseView
          to clear unread badge when user opens a case.
      */}
    </div>
  );
}
