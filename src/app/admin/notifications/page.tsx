"use client"
import { useEffect, useState } from "react";

type Notification = {
  _id: string;
  receiver: string;
  title: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/admin/notifications", { credentials: "include" });
      const data = await res.json();
      console.log(data);
      setNotifications(data || []);
      setSelectedNotification(data?.[0] || null);
    };
    fetchData();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="flex gap-6">
      {/* Notification List */}
      <div className="w-2/3 bg-[#F1F3FB] p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">🔔 Notifications</h2>
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`border-l-4 pl-4 py-3 mb-2 cursor-pointer rounded transition ${
                selectedNotification?._id === n._id
                  ? "border-blue-600 bg-white shadow"
                  : "border-gray-300 hover:bg-white/50"
              } ${!n.isRead ? "bg-blue-50" : ""}`}
              onClick={() => setSelectedNotification(n)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{n.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{n.message}</p>
                </div>
            
              </div>
              <p className="text-xs text-gray-500 mt-2">{formatDate(n.createdAt)}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No notifications yet.</p>
        )}
      </div>

      {/* Notification Detail */}
      <div className="w-1/3 bg-white p-6 rounded-2xl shadow-md">
        <h3 className="text-lg font-bold mb-4">📋 Details</h3>
        {selectedNotification ? (
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
              <p className="font-semibold text-gray-800">{selectedNotification.type}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Title</p>
              <p className="font-semibold text-gray-800">{selectedNotification.title}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Message</p>
              <p className="text-sm text-gray-700 italic">"{selectedNotification.message}"</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
            
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                <p className="text-sm text-gray-700">{formatDate(selectedNotification.createdAt)}</p>
              </div>
            </div>

          
          </div>
        ) : (
          <p className="text-sm text-gray-400">Select a notification to view details.</p>
        )}
      </div>
    </div>
  );
}
