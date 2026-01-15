import React from "react";
import { useParams, Link } from "react-router-dom";

export default function ApprenticeCaseView() {
  const { caseId } = useParams();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="bg-slate-900 text-white border border-slate-700 rounded-lg p-6 w-full">
          <h1 className="text-2xl font-bold">Case #{caseId}</h1>
          <p className="text-slate-300 mt-1">
            Add internal notes for the lawyer (client will not see these).
          </p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 text-slate-200">
        <div className="font-semibold text-white mb-2">Notes (placeholder)</div>
        <div className="text-sm text-slate-300">
          API integration next: GET notes + POST note.
        </div>

        <div className="mt-4">
          <Link
            to="/apprentice/dashboard"
            className="inline-block text-amber-400 hover:text-amber-300"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
