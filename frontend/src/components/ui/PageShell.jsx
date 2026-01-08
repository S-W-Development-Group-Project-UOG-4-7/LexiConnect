import React from "react";

/**
 * PageShell
 * Wrapper for pages to keep consistent spacing, max-width, and optional header actions.
 */
export default function PageShell({
  title,
  subtitle,
  actions,
  children,
  maxWidth = "max-w-5xl",
  className = "",
  contentClassName = "",
}) {
  return (
    <div className={`min-h-screen bg-slate-900 text-white px-4 py-6 ${className}`}>
      <div className={`${maxWidth} mx-auto space-y-6`}>
        {(title || subtitle || actions) && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {title && <h1 className="text-3xl font-bold">{title}</h1>}
              {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}

        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
}
