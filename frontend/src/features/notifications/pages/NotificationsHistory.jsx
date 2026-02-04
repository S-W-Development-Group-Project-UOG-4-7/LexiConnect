import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRole } from "../../../services/auth";

import {
  listNotifications,
  markNotificationRead,
} from "../services/notifications.service";

const PAGE_SIZE = 25;

export default function NotificationsHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  const loadNotifications = async (nextPage = page, nextFilter = filter) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: nextPage,
        page_size: PAGE_SIZE,
      };
      if (nextFilter === "unread") {
        params.unread = true;
      }
      const data = await listNotifications(params);
      const list = Array.isArray(data?.items) ? data.items : [];
      setTotal(Number(data?.total || 0));
      setPage(nextPage);
      setItems(list);
    } catch (err) {
      setError("Failed to load notifications.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      await loadNotifications(page, filter);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications(1, filter);
  }, [filter]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const role = (getRole() || localStorage.getItem("role") || "").toLowerCase();
    if (role === "lawyer") return navigate("/lawyer/dashboard");
    if (role === "admin") return navigate("/admin/dashboard");
    return navigate("/client/dashboard");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Notifications</h1>
          <p className="text-sm text-slate-400">
            Track updates and mark items as read.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={[
              "px-3 py-1.5 rounded-full text-sm",
              filter === "all"
                ? "bg-slate-800 text-white"
                : "bg-slate-900 text-slate-300 hover:text-white",
            ].join(" ")}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={[
              "px-3 py-1.5 rounded-full text-sm",
              filter === "unread"
                ? "bg-slate-800 text-white"
                : "bg-slate-900 text-slate-300 hover:text-white",
            ].join(" ")}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center">
          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-slate-300 hover:text-white"
          >
            ← Back
          </button>
        </div>
        <div className="px-5 py-3 border-b border-slate-800 text-sm text-slate-400">
          Showing {items.length} of {total}
        </div>

        {loading ? (
          <div className="p-5 text-slate-300">Loading…</div>
        ) : error ? (
          <div className="p-5 text-rose-300">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-5 text-slate-400">No notifications found.</div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {items.map((n) => (
              <li key={n.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">{n.title}</div>
                  <div className="text-xs text-slate-300 mt-1">
                    {n.body || n.message}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!n.is_read ? (
                    <span className="text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded-full">
                      Unread
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Read</span>
                  )}
                  {!n.is_read ? (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-slate-200 hover:text-white"
                    >
                      Mark as read
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => loadNotifications(page - 1, filter)}
            className="text-sm text-slate-300 hover:text-white disabled:text-slate-600"
            disabled={page <= 1}
          >
            Prev
          </button>
          <div className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </div>
          <button
            type="button"
            onClick={() => loadNotifications(page + 1, filter)}
            className="text-sm text-slate-300 hover:text-white disabled:text-slate-600"
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
