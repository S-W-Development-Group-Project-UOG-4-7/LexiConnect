import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { listCaseDocuments, downloadDocument } from "../services/documents.service";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function LawyerCaseDocuments() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const caseIdNum = useMemo(() => Number(caseId), [caseId]);
  const hasValidCaseId = Number.isInteger(caseIdNum) && caseIdNum > 0;

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");

    if (!hasValidCaseId) {
      setDocs([]);
      setLoading(false);
      setErr("Invalid case id.");
      return;
    }

    try {
      const data = await listCaseDocuments(caseIdNum);
      setDocs(Array.isArray(data) ? data : []);
    } catch (e) {
      setDocs([]);
      const status = e?.response?.status;
      if (status === 401) setErr("Unauthorized. Please login again.");
      else if (status === 403) setErr("Not allowed to view documents for this case.");
      else setErr(e?.response?.data?.detail || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseIdNum]);

  const resolveFileUrl = (fileUrl) => {
    if (!fileUrl) return "";
    if (String(fileUrl).startsWith("http")) return fileUrl;
    const base = API_BASE.replace(/\/+$/, "");
    const path = String(fileUrl).startsWith("/") ? fileUrl : `/${fileUrl}`;
    return `${base}${path}`;
  };

  const downloadViaApi = async (docId, filenameHint) => {
    try {
      const res = await downloadDocument(docId);
      const blob = res?.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filenameHint || `document_${docId}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setErr("Download failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
              Manage Case Documents
            </p>
            <h1 className="text-3xl font-bold">Case #{hasValidCaseId ? caseIdNum : "N/A"}</h1>
            <p className="text-slate-400 text-sm">
              View files uploaded for this case.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/lawyer/cases/${caseIdNum}`)}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-sm"
            >
              Back
            </button>
          </div>
        </div>

        {err && (
          <div className="bg-red-900/40 border border-red-700 p-3 rounded text-sm">
            {err}
          </div>
        )}

        {loading && <div className="text-slate-400">Loading documents...</div>}

        {!loading && docs.length === 0 && !err && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center">
            <div className="text-lg font-semibold">No documents uploaded yet.</div>
            <div className="text-slate-400 text-sm mt-1">
              Uploads will appear here once added to the case.
            </div>
          </div>
        )}

        {!loading && docs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {docs.map((doc) => {
              const name =
                doc.title || doc.original_filename || doc.file_name || `Document #${doc.id}`;
              const openHref = resolveFileUrl(doc.file_url || doc.fileUrl || "");
              return (
                <div
                  key={doc.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
                >
                  <div>
                    <div className="text-white font-semibold">{name}</div>
                    <div className="text-xs text-slate-400">
                      Uploaded {formatDateTime(doc.created_at || doc.uploaded_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {openHref ? (
                      <a
                        href={openHref}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white hover:bg-slate-700"
                      >
                        Open
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => downloadViaApi(doc.id, name)}
                      className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      Download
                    </button>
                    <span className="text-[11px] text-slate-500 self-center">
                      Secure download
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
