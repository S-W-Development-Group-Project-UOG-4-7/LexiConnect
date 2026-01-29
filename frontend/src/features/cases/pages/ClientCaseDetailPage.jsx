import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageShell from "../../../components/ui/PageShell";
import { getCaseById } from "../services/cases.service";
import CaseRequestsPanel from "../components/CaseRequestsPanel";

export default function ClientCaseDetailPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const cid = Number(caseId);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getCaseById(cid);
        setData(res);
      } catch (e) {
        const msg = e?.response?.data?.detail || e?.response?.data?.message || "Failed to load case.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (Number.isFinite(cid)) load();
  }, [cid]);

  return (
    <PageShell
      title={data ? data.title : `Case #${cid}`}
      subtitle="View case details and manage requests"
      maxWidth="max-w-4xl"
      contentClassName="space-y-4"
    >
      {loading && <div className="text-slate-300">Loading case…</div>}

      {error && !loading && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase text-slate-400">Case</div>
                <div className="text-xl font-semibold text-white">{data.title}</div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs bg-slate-900 border border-slate-700 text-slate-200">
                {data.status || "unknown"}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-200">
              <div>
                <div className="text-slate-400 text-xs uppercase">Category</div>
                <div>{data.category || "—"}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase">District</div>
                <div>{data.district || "—"}</div>
              </div>
            </div>
            <div className="text-sm text-slate-200">
              <div className="text-slate-400 text-xs uppercase">Public Summary</div>
              <div className="whitespace-pre-wrap">{data.summary_public || "—"}</div>
            </div>
            {data.summary_private && (
              <div className="text-sm text-slate-200">
                <div className="text-slate-400 text-xs uppercase">Private Summary</div>
                <div className="whitespace-pre-wrap">{data.summary_private}</div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {["overview", "requests"].map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                    active
                      ? "bg-amber-600/20 border-amber-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
                  }`}
                >
                  {tab === "overview" ? "Overview" : "Requests"}
                </button>
              );
            })}
          </div>

          {activeTab === "overview" && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-2 text-sm text-slate-200">
              <div>
                <span className="text-slate-400 text-xs uppercase">Status</span> {data.status || "—"}
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase">Created</span>{" "}
                {data.created_at ? new Date(data.created_at).toLocaleString() : "—"}
              </div>
            </div>
          )}

          {activeTab === "requests" && <CaseRequestsPanel caseId={cid} />}

          <div className="flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
            >
              Back
            </button>
          </div>
        </>
      )}
    </PageShell>
  );
}
