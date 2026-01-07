import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageShell from "../../../components/ui/PageShell";
import {
  getChecklistStatus,
  getCaseChecklistAnswers,
  saveCaseChecklistAnswer,
  getRequiredTemplates,
} from "../services/checklist.service";

export default function ClientCaseChecklistPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const cid = Number(caseId);
  const servicePackageId = useMemo(() => {
    const v = sp.get("service_package_id");
    return v ? Number(v) : null;
  }, [sp]);

  const [status, setStatus] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [requiredTemplates, setRequiredTemplates] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [editMode, setEditMode] = useState({});

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [err, setErr] = useState("");

  const missing = status?.missing_required || [];

  // Map answers by template_id (from current answers state)
  const answerByTemplate = useMemo(() => {
    const map = new Map();
    for (const a of answers || []) map.set(a.template_id, a);
    return map;
  }, [answers]);

  const missingIdSet = useMemo(() => new Set((missing || []).map((m) => m.id)), [missing]);

  const totalRequired = requiredTemplates.length || status?.total_required || 0;
  const completedCount = status?.completed_required ?? 0;

  async function refreshAll() {
    setErr("");
    setLoading(true);

    try {
      if (!servicePackageId) {
        setErr("service_package_id missing in URL");
        setStatus(null);
        setAnswers([]);
        setRequiredTemplates([]);
        return;
      }

      const [st, ans, req] = await Promise.all([
        getChecklistStatus(cid, servicePackageId),
        getCaseChecklistAnswers(cid),
        getRequiredTemplates(servicePackageId),
      ]);

      const answersList = ans || [];
      const reqList = req || [];

      // ✅ Build map from freshly loaded answers (NOT from state)
      const freshMap = new Map();
      for (const a of answersList) freshMap.set(a.template_id, a);

      setStatus(st);
      setAnswers(answersList);
      setRequiredTemplates(reqList);

      // ✅ Drafts: default to saved answer_text if exists
      setDrafts((prev) => {
        const next = { ...prev };
        for (const t of reqList) {
          const k = String(t.id);
          if (next[k] === undefined) next[k] = freshMap.get(t.id)?.answer_text || "";
        }
        return next;
      });

      // ✅ If checklist complete, stop edit mode for all
      if ((st?.missing_required || []).length === 0) {
        setEditMode({});
      }
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load checklist");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(cid) || cid <= 0) return;
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid, servicePackageId]);

  async function saveTemplateText(templateId) {
    const key = String(templateId);
    const value = (drafts[key] || "").trim();

    if (!value) {
      setErr("Answer cannot be empty.");
      return;
    }

    setSavingId(templateId);
    setErr("");

    try {
      const row = await saveCaseChecklistAnswer(cid, {
        template_id: templateId,
        answer_text: value,
        document_id: null,
      });

      setAnswers((prev) => {
        const next = (prev || []).filter((x) => x.template_id !== templateId);
        return [row, ...next];
      });

      setEditMode((p) => ({ ...p, [key]: false }));

      const st = await getChecklistStatus(cid, servicePackageId);
      setStatus(st);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to save answer");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <PageShell
      title={`Checklist · Case #${cid}`}
      subtitle="Complete required items to unlock booking"
      maxWidth="max-w-3xl"
      contentClassName="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4"
    >
      {loading && <div className="text-slate-300">Loading…</div>}

      {err && (
        <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {err}
        </div>
      )}

      {!loading && status && (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-200">
            Required: <b>{completedCount}</b> / <b>{totalRequired}</b> completed
          </div>

          <button
            type="button"
            onClick={refreshAll}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
          >
            Refresh
          </button>
        </div>
      )}

      {!loading && status && missing.length === 0 && (
        <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg text-emerald-200 text-sm">
          ✅ Checklist complete. Booking is unlocked.
          <div className="text-slate-300 text-xs mt-1">You can still edit completed items below.</div>
        </div>
      )}

      {!loading && requiredTemplates.length > 0 && (
        <div className="space-y-3">
          {requiredTemplates.map((item) => {
            const key = String(item.id);
            const ans = answerByTemplate.get(item.id);

            const isMissing = missingIdSet.has(item.id);
            const isEditing = isMissing || !!editMode[key];
            const isSaving = savingId === item.id;

            // ✅ show saved answer first; drafts used while editing
            const savedText = (ans?.answer_text || "").trim();
            const draftText = drafts[key] ?? "";
            const displayText = isEditing ? draftText : savedText || draftText;

            return (
              <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-white font-semibold">{item.question || `Checklist Item #${item.id}`}</div>
                    {item.helper_text && <div className="text-slate-400 text-sm">{item.helper_text}</div>}
                    <div className="text-xs mt-1">
                      {isMissing ? (
                        <span className="text-amber-300">Missing</span>
                      ) : (
                        <span className="text-emerald-300">Completed</span>
                      )}
                    </div>
                  </div>

                  {!isMissing && (
                    <button
                      type="button"
                      onClick={() => {
                        // when entering edit, preload draft with savedText
                        setDrafts((p) => ({ ...p, [key]: savedText || p[key] || "" }));
                        setEditMode((p) => ({ ...p, [key]: !p[key] }));
                      }}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <>
                    <textarea
                      rows={3}
                      value={draftText}
                      onChange={(e) => setDrafts((p) => ({ ...p, [key]: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                      placeholder="Enter answer"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => saveTemplateText(item.id)}
                        disabled={isSaving}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 disabled:opacity-60 text-white rounded-lg text-sm"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-200 text-sm whitespace-pre-wrap">
                    {displayText ? displayText : <span className="text-slate-400">(no text)</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          Go back to Booking
        </button>
      </div>
    </PageShell>
  );
}
