"use client";

import { useEffect, useState } from "react";
import { FiStar, FiChevronDown, FiChevronUp, FiPaperclip } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";

interface Notification {
  _id: string;
  receiver: string;
  message: string;
  title: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  refId?: any;
  refModel?: string;
}

interface NotificationGroup {
  [key: string]: Notification[];
}

export default function NotificationPage() {
  const [expanded, setExpanded] = useState(false);
  const [notifications, setNotifications] = useState<NotificationGroup>({});
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  // Group notifications by date
  const groupNotificationsByDate = (notifs: Notification[]): NotificationGroup => {
    const groups: NotificationGroup = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifs.forEach((notification) => {
      const notifDate = new Date(notification.createdAt);
      const dateStr = notifDate.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let groupKey: string;

      if (dateStr === todayStr) {
        groupKey = "Today";
      } else if (dateStr === yesterdayStr) {
        groupKey = "Yesterday";
      } else {
        groupKey = notifDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  };

  useEffect(() => {

    const fetchData = async () => {
      try {

        const res = await fetch(`/api/schools/notification/`, { credentials: "include" });
        const data = await res.json();

        console.log("API Response:", data);

        // Get the notifications array from the response
        const notificationsArray = data.notifications || [];

        // Group them by date
        const groupedNotifications = groupNotificationsByDate(notificationsArray);
        setNotifications(groupedNotifications);

        // Set the first notification as selected
        if (notificationsArray.length > 0) {
          setSelectedNotification(notificationsArray[0]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchMarkAsread = async () => {
      try {
        const res = await fetch(`/api/schools/notification/`, {
          method: "PATCH",
          credentials: "include"
        });

      } catch (error) {
        console.error("Error marking as read  notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkAsread()
    fetchData();
  }, []);

  // Format time from ISO string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Format full date
  const formatFullDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Notification List */}
        <div className="w-full md:w-2/6 border-r p-6 bg-[#F1F4FD] overflow-y-auto max-h-screen">
          <h2 className="text-xl font-semibold text-[#2C2F5A] mb-6">Notifications</h2>

          {Object.keys(notifications).length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500">No notifications available</p>
            </div>
          ) : (
            Object.entries(notifications).map(([dateGroup, items]) => {
              if (!Array.isArray(items)) return null;

              return (
                <div key={dateGroup} className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">{dateGroup}</p>
                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <p className="text-xs text-gray-400 ml-2">No notifications</p>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => setSelectedNotification(item)}
                          className={`bg-white rounded-lg px-4 py-3 cursor-pointer hover:bg-[#E4EBFF] transition-all ${selectedNotification?._id === item._id
                            ? "bg-[#E4EBFF] border-l-4 border-blue-500 shadow-sm"
                            : "border-l-4 border-transparent"
                            } ${!item.isRead ? "font-semibold" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <FiPaperclip className="text-gray-500 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="text-xs text-gray-500 whitespace-nowrap">{formatTime(item.createdAt)}</span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {item.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === "EXPIRY_WARNING" ? "bg-yellow-100 text-yellow-700" :
                                  item.type === "EXPIRY_ALERT" ? "bg-red-100 text-red-700" :
                                    item.type === "TASK" ? "bg-blue-100 text-blue-700" :
                                      "bg-gray-100 text-gray-700"
                                  }`}>
                                  {item.type}
                                </span>

                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detailed View */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-white">
          {selectedNotification ? (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b">
                <div>
                  <p className="font-semibold text-sm text-gray-800"> Notification</p>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-3">
                  <span className="whitespace-nowrap">{formatFullDate(selectedNotification.createdAt)}</span>
                  <FiStar className="text-gray-400 cursor-pointer hover:text-yellow-400 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">

              </div>

              <div className="bg-[#E9EEFF] px-5 py-4 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">Notification Type</p>
                    <p className={`text-sm font-semibold px-3 py-1 rounded-full inline-block ${selectedNotification.type === "EXPIRY_WARNING" ? "bg-yellow-100 text-yellow-800" :
                      selectedNotification.type === "EXPIRY_ALERT" ? "bg-red-100 text-red-800" :
                        selectedNotification.type === "TASK" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                      }`}>
                      {selectedNotification.type}
                    </p>
                  </div>

                </div>
              </div>

              <div className="border rounded-xl p-5 bg-white shadow-sm">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpanded(!expanded)}
                >
                  <h3 className="text-sm font-semibold text-gray-700">
                    Message Details
                  </h3>
                  {expanded ? <FiChevronUp className="text-gray-600" /> : <FiChevronDown className="text-gray-600" />}
                </div>
                {expanded && (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedNotification.message}
                    </p>

                  </div>
                )}
              </div>

              {/* Action button for specific notification types */}
              {(selectedNotification.type === "EXPIRY_WARNING" || selectedNotification.type === "EXPIRY_ALERT") && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800 mb-3">
                    <strong>Action Required:</strong> Please renew your subscription to continue using all features.
                  </p>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
                    Renew Subscription
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-300 mb-4">
                <FiPaperclip size={64} />
              </div>
              <p className="text-gray-500 text-lg">Select a notification to view details</p>
              <p className="text-gray-400 text-sm mt-2">Choose from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
