import React from "react";

const formatTime = (value) => {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString();
};

export default function NotificationPanel({
  open,
  onClose,
  notifications = [],
  loading,
  error,
  onItemClick,
  onMarkAll,
  onViewAll,
}) {
  if (!open) return null;

  return (
    <div className="absolute right-0 top-12 z-[9999] min-w-[360px] max-w-[420px]">
      <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div>
            <div className="text-sm font-semibold text-white">Notifications</div>
            <div className="text-[11px] text-slate-400">Latest updates</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white"
            aria-label="Close notifications panel"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800 text-xs">
          <button
            type="button"
            onClick={onMarkAll}
            className="text-slate-200 hover:text-white"
          >
            Mark all as read
          </button>
          <button
            type="button"
            onClick={onViewAll}
            className="text-blue-400 hover:text-blue-300"
          >
            View all
          </button>
        </div>

        <div className="max-h-[360px] overflow-auto">
          {loading ? (
            <div className="p-4 text-slate-300 text-sm">Loading…</div>
          ) : error ? (
            <div className="p-4 text-rose-300 text-sm">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-slate-400 text-sm">No notifications.</div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={[
                    "px-4 py-3 cursor-pointer hover:bg-slate-900/70",
                    n.is_read ? "opacity-85" : "bg-slate-900/40",
                  ].join(" ")}
                  onClick={() => onItemClick?.(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onItemClick?.(n);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400/80" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-white">
                          {n.title}
                        </div>
                        {!n.is_read ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            Unread
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {n.body || n.message}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-2">
                        {formatTime(n.created_at)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
