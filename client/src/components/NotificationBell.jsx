
import { useCallback, useEffect, useState } from "react";
import "./NotificationBell.css";

const API = "https://imovies-9zv6.onrender.com";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("imoviesToken");

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load notifications");
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.message || "Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
  fetchNotifications();

  const handleNotificationUpdate = () => {
    fetchNotifications();
  };

  window.addEventListener(
    "imovies-notifications-update",
    handleNotificationUpdate
  );

  return () => {
    window.removeEventListener(
      "imovies-notifications-update",
      handleNotificationUpdate
    );
  };
}, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${API}/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Could not mark notification as read");
      }

      setNotifications((current) =>
        current.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      setError(err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API}/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Could not mark notifications as read");
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) return null;

  return (
    <div className="notification-wrapper">
      <button
        className="notification-bell"
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          if (nextOpen) fetchNotifications();
        }}
      >
        <span className="notification-bell-icon">♧</span>

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>

            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-read-all"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {error && <p className="notification-error">{error}</p>}

          {loading ? (
            <p className="notification-empty">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="notification-empty">
              You're all caught up!
            </p>
          ) : (
            <div className="notification-list">
              {notifications.map((item) => (
                <button
                  type="button"
                  key={item._id}
                  className={`notification-item ${
                    item.isRead ? "is-read" : "is-unread"
                  }`}
                  onClick={() => {
                    if (!item.isRead) markAsRead(item._id);
                  }}
                >
                  <span className="notification-item-title">
                    {item.title}
                  </span>

                  <span className="notification-item-message">
                    {item.message}
                  </span>

                  <span className="notification-item-date">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
