import React from "react";
import { Link } from "react-router-dom";

/**
 * EmptyState
 * Simple empty state block with optional CTA link.
 */
export default function EmptyState({
  title,
  description,
  buttonLabel,
  buttonLink,
  className = "",
}) {
  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-lg p-6 text-center space-y-3 ${className}`}>
      {title && <div className="text-lg font-semibold text-white">{title}</div>}
      {description && <div className="text-sm text-slate-400">{description}</div>}
      {buttonLabel && buttonLink && (
        <div className="pt-2">
          <Link
            to={buttonLink}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
          >
            {buttonLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
