import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../components/ui/PageShell";
import { getCaseById } from "../services/cases.service";

export default function LawyerCaseDetailPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const cid = Number(caseId);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getCaseById(cid);
        setData(res);
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to load case.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (!Number.isFinite(cid)) {
      setError("Invalid case id");
      setLoading(false);
      return;
    }
    load();
  }, [cid]);

  return (
    <PageShell
      title={data?.title || `Case #${cid}`}
      subtitle="View case details"
      maxWidth="max-w-5xl"
      contentClassName="space-y-4"
    >
      {loading && <div className="text-slate-300 text-sm">Loading case…</div>}

      {error && !loading && (
        <div className="text-sm text-red-200 border border-red-700 bg-red-900/30 rounded-lg p-3">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold text-lg">{data.title}</div>
            <span className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-200">
              {data.status || "—"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-400 text-xs">CATEGORY</div>
              <div className="text-slate-200">{data.category || "—"}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">DISTRICT</div>
              <div className="text-slate-200">{data.district || "—"}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">CASE ID</div>
              <div className="text-slate-200">{data.id}</div>
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-xs">PUBLIC SUMMARY</div>
            <div className="text-slate-200">{data.summary_public || "—"}</div>
          </div>

          {data.summary_private ? (
            <div>
              <div className="text-slate-400 text-xs">PRIVATE SUMMARY</div>
              <div className="text-slate-200">{data.summary_private}</div>
            </div>
          ) : null}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white"
        >
          Back
        </button>
      </div>
    </PageShell>
  );
}
