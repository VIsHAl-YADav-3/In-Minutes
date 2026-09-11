import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import api from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import { TextLineSkeleton } from "../components/Skeletons.jsx";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/notifications")
      .then((res) => setNotifications(res.data.notifications))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={markAllRead} className="text-sm font-medium text-brand-600">
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <TextLineSkeleton className="w-full" />
          <TextLineSkeleton className="w-full" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={BellOff} title="No Notifications Yet" description="We'll let you know when something happens with your orders." />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div key={n._id} className={`card flex gap-3 p-3.5 ${!n.isRead ? "border-l-4 border-brand-500" : ""}`}>
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50">
                <Bell className="h-4 w-4 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-sm text-ink-900/60">{n.message}</p>
                <p className="mt-1 text-xs text-ink-900/40">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
