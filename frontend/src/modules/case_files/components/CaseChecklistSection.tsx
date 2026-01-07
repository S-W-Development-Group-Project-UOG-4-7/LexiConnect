import React, { useEffect, useState } from "react";
import {
  initChecklist,
  getChecklist,
  getChecklistIsComplete,
} from "../api/caseChecklist";

const CaseChecklistSection: React.FC = () => {
  const caseId = 1;

  const [items, setItems] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const normalizeItems = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  };

  const normalizeIsComplete = (data: any): boolean => {
    if (typeof data === "boolean") return data;
    if (data && typeof data.is_complete === "boolean") return data.is_complete;
    if (data && typeof data.complete === "boolean") return data.complete;
    return false;
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const [listData, completeData] = await Promise.all([
        getChecklist(caseId),
        getChecklistIsComplete(caseId),
      ]);
      setItems(normalizeItems(listData));
      setIsComplete(normalizeIsComplete(completeData));
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load checklist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onInit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await initChecklist(caseId);
      setSuccess("Checklist initialized");
      await refresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Init failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Case Checklist</h2>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            isComplete
              ? "bg-green-900/30 text-green-300 border-green-500/50"
              : "bg-yellow-900/30 text-yellow-300 border-yellow-500/50"
          }`}
        >
          {isComplete ? "Complete" : "Not Complete"}
        </span>
      </div>

      {loading && <div className="text-gray-300 mt-2">Loading...</div>}
      {error && <div className="text-red-300 mt-2">{error}</div>}
      {success && <div className="text-green-300 mt-2">{success}</div>}

      <div className="mt-3">
        <button
          onClick={onInit}
          disabled={loading}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:opacity-50 text-white rounded-md font-medium transition-colors"
        >
          Initialize checklist
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((it: any) => {
          const label =
            it.label ||
            it.name ||
            it.title ||
            it.item ||
            it.key ||
            `Item ${it.id ?? ""}`;

          const done =
            typeof it.is_done === "boolean"
              ? it.is_done
              : typeof it.completed === "boolean"
              ? it.completed
              : typeof it.is_complete === "boolean"
              ? it.is_complete
              : false;

          return (
            <li
              key={it.id ?? label}
              className="flex items-center justify-between gap-3 bg-slate-900/40 border border-slate-700 rounded-md px-3 py-2"
            >
              <span className="text-sm text-gray-100">{label}</span>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full border ${
                  done
                    ? "bg-green-900/30 text-green-300 border-green-500/50"
                    : "bg-slate-800 text-slate-300 border-slate-600"
                }`}
              >
                {done ? "Done" : "Pending"}
              </span>
            </li>
          );
        })}

        {!loading && items.length === 0 && (
          <li className="text-gray-300 text-sm">No checklist items</li>
        )}
      </ul>
    </div>
  );
};

export default CaseChecklistSection;
