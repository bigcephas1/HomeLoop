"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/notifications");
      const notificationsList = response.data.notifications || [];
      setNotifications(notificationsList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingData(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      fetchNotifications();
      window.dispatchEvent(new Event("notificationsUpdated"));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
      window.dispatchEvent(new Event("notificationsUpdated"));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      booking: "📅",
      payment: "💰",
      review: "⭐",
      moderation: "🔒",
      property: "🏠",
      service: "🛠️",
      chat: "💬",
      inspection: "🔍",
      system: "🔔"
    };
    return icons[type] || "📢";
  };

  const getNotificationLink = (notification) => {
    if (notification.link) return notification.link;
    
    const role = user?.role;
    switch (notification.type) {
      case "moderation":
        if (role === "landlord") return "/dashboard/landlord/credibility";
        if (role === "service_provider") return "/dashboard/service-provider/credibility";
        if (role === "representative") return "/dashboard/representative/credibility";
        return "/profile";
      case "booking":
        if (role === "landlord") return "/dashboard/landlord/bookings";
        return "/dashboard/user/bookings";
      case "payment":
        if (role === "landlord") return "/dashboard/landlord/payments";
        return "/dashboard/user/payments";
      case "property":
        if (role === "landlord") return "/dashboard/landlord/properties";
        return "/properties";
      case "service":
        return "/dashboard/service-provider/services";
      case "inspection":
        if (role === "representative") return "/dashboard/representative/inspections";
        return "/dashboard/user/inspections";
      default:
        return "#";
    }
  };

  const getFilteredNotifications = () => {
    if (filter === "all") return notifications;
    return notifications.filter(n => n.type === filter);
  };

  const notificationTypes = [
    { value: "all", label: "All" },
    { value: "booking", label: "Bookings" },
    { value: "payment", label: "Payments" },
    { value: "review", label: "Reviews" },
    { value: "moderation", label: "Verification" },
    { value: "property", label: "Properties" },
  ];

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {notificationTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === type.value
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {type.label}
            {type.value !== "all" && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-500 text-white rounded-full">
                {notifications.filter(n => n.type === type.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-xl font-semibold mb-2">No Notifications</h2>
          <p className="text-gray-500">
            {filter === "all" 
              ? "You don't have any notifications yet."
              : `No ${filter} notifications found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition ${
                !notification.isRead ? "border-l-4 border-blue-500" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <Link 
                  href={getNotificationLink(notification)}
                  className="flex items-start gap-3 flex-1 hover:opacity-80 transition"
                >
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                        {notification.type}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
