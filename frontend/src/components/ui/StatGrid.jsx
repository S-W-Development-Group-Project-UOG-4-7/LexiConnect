import React from "react";

/**
 * StatGrid
 * Renders a responsive grid of stat cards.
 * items: Array<{ label: string, value: React.ReactNode, hint?: string }>
 */
export default function StatGrid({ items = [], className = "" }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm flex flex-col gap-1"
        >
          <div className="text-xs uppercase tracking-wide text-slate-400">{item.label}</div>
          <div className="text-2xl font-semibold text-white leading-tight">
            {item.value ?? "—"}
          </div>
          {item.hint && <div className="text-sm text-slate-400">{item.hint}</div>}
        </div>
      ))}
    </div>
  );
}
