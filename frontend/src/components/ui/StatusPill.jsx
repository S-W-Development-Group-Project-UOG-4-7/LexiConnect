import React from "react";

const styleMap = {
  pending: "bg-amber-900/30 text-amber-200 border border-amber-600/60",
  confirmed: "bg-green-900/30 text-green-200 border border-green-600/60",
  resolved: "bg-green-900/30 text-green-200 border border-green-600/60",
  rejected: "bg-red-900/30 text-red-200 border border-red-600/60",
  cancelled: "bg-slate-800 text-slate-200 border border-slate-600/70",
};

/**
 * StatusPill
 * Maps status strings to consistent pill styles.
 */
export default function StatusPill({ status, className = "" }) {
  const normalized = (status || "").toString().toLowerCase();
  const style = styleMap[normalized] || "bg-slate-800 text-slate-200 border border-slate-600/70";
  const label = status ? status.toString().toUpperCase() : "UNKNOWN";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center ${style} ${className}`}
    >
      {label}
    </span>
  );
}
