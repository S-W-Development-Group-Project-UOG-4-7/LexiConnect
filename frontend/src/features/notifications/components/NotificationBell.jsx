import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRole } from "../../../services/auth";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications.service";
import NotificationPanel from "./NotificationPanel";

const POLL_MS = 10000;
const PANEL_LIMIT = 10;

const buildEntityPath = (notification, role) => {
  if (!notification?.entity_type) return null;

  if (notification.entity_type === "booking") {
    if (role === "lawyer") return "/lawyer/bookings/incoming";
    if (role === "admin") return "/admin/dashboard";
    return "/client/manage-bookings";
  }

  if (notification.entity_type === "case" && notification?.entity_id) {
    if (role === "lawyer") return `/lawyer/cases/${notification.entity_id}`;
    if (role === "admin") return "/admin/audit-log";
    return `/client/cases/${notification.entity_id}`;
  }

  return null;
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const role = useMemo(() => (getRole() || "").toLowerCase(), []);
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  const refreshUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(Number(data?.unread_count || 0));
    } catch {
      // Keep previous value on transient failures
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listNotifications({ page: 1, page_size: PANEL_LIMIT });
      const items = Array.isArray(data?.items) ? data.items : [];
      setNotifications(items);
    } catch (err) {
      setError("Failed to load notifications.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (notification) => {
    try {
      if (!notification?.is_read) {
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, is_read: true } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }

    const path = buildEntityPath(notification, role);
    if (path) {
      setPanelOpen(false);
      navigate(path);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewAll = () => {
    setPanelOpen(false);
    navigate("/notifications");
  };

  useEffect(() => {
    refreshUnreadCount();
    pollRef.current = setInterval(refreshUnreadCount, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (panelOpen) {
      loadNotifications();
    }
  }, [panelOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-slate-200 hover:bg-slate-800"
        aria-label="Open notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm6.5-6V11a6.5 6.5 0 1 0-13 0v5l-2 2v1h17v-1l-2-2z" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      <NotificationPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        notifications={notifications}
        loading={loading}
        error={error}
        onItemClick={handleItemClick}
        onMarkAll={handleMarkAll}
        onViewAll={handleViewAll}
      />
    </div>
  );
}
