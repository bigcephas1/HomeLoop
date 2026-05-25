"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Store current path for "Go Back" functionality
  useEffect(() => {
    if (pathname) {
      sessionStorage.setItem("previousPath", pathname);
    }
  }, [pathname]);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Fetch unread messages count
  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await api.get("/messages/conversations");
      const conversations = response.data || [];
      // Count conversations with unread messages (where last message not read by user)
      const unread = conversations.filter(conv => {
        const lastMessage = conv.lastMessage;
        // Simple count - in production, you'd track read status per conversation
        return conv.lastMessage && !conv.lastMessage.readBy?.includes(user?._id);
      }).length;
      setUnreadMessagesCount(unread);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchUnreadMessagesCount();
      // Listen for notification updates
      window.addEventListener("favoritesUpdated", fetchUnreadCount);
      window.addEventListener("notificationsUpdated", fetchUnreadCount);
      window.addEventListener("messagesUpdated", fetchUnreadMessagesCount);
      return () => {
        window.removeEventListener("favoritesUpdated", fetchUnreadCount);
        window.removeEventListener("notificationsUpdated", fetchUnreadCount);
        window.removeEventListener("messagesUpdated", fetchUnreadMessagesCount);
      };
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const getDashboardLinks = () => {
    const role = user.role;
    const links = {
      admin: [
        { href: "/admin", label: "Overview", icon: "📊" },
        { href: "/admin/users", label: "Users", icon: "👥" },
        { href: "/admin/properties", label: "Properties", icon: "🏠" },
        { href: "/admin/providers", label: "Providers", icon: "🔧" },
        { href: "/admin/reports", label: "Reports", icon: "📈" },
      ],
      landlord: [
        { href: "/dashboard/landlord", label: "Overview", icon: "📊" },
        { href: "/dashboard/landlord/properties", label: "My Properties", icon: "🏠" },
        { href: "/dashboard/landlord/properties/create", label: "Add Property", icon: "➕" },
        { href: "/dashboard/landlord/tenants", label: "Tenants", icon: "👥" },
        { href: "/dashboard/landlord/payments", label: "Payments", icon: "💰" },
        { href: "/dashboard/landlord/bookings", label: "Bookings", icon: "📅" },
        { href: "/dashboard/landlord/credibility", label: "Verification", icon: "✓" },
      ],
      service_provider: [
        { href: "/dashboard/service-provider", label: "Overview", icon: "📊" },
        { href: "/dashboard/service-provider/services", label: "My Services", icon: "🛠️" },
        { href: "/dashboard/service-provider/services/create", label: "Add Service", icon: "➕" },
        { href: "/dashboard/service-provider/bookings", label: "Bookings", icon: "📅" },
        { href: "/dashboard/service-provider/schedule", label: "Schedule", icon: "📆" },
        { href: "/dashboard/service-provider/credibility", label: "Credibility", icon: "⭐" },
      ],
      representative: [
        { href: "/dashboard/representative", label: "Overview", icon: "📊" },
        { href: "/dashboard/representative/clients", label: "My Clients", icon: "👥" },
        { href: "/dashboard/representative/deals", label: "Active Deals", icon: "🤝" },
        { href: "/dashboard/representative/properties", label: "Properties", icon: "🏠" },
        { href: "/dashboard/representative/inspections", label: "Inspections", icon: "🔍" },
        { href: "/dashboard/representative/schedule", label: "Schedule", icon: "📆" },
        { href: "/dashboard/representative/credibility", label: "Verification", icon: "✓" },
      ],
      client: [
        { href: "/dashboard/user", label: "Overview", icon: "📊" },
        { href: "/dashboard/user/properties", label: "Saved Properties", icon: "❤️" },
        { href: "/dashboard/user/bookings", label: "My Bookings", icon: "📅" },
        { href: "/dashboard/user/service-bookings", label: "Service Bookings", icon: "🛠️" },
        { href: "/dashboard/user/favorites", label: "Favorites", icon: "⭐" },
        { href: "/dashboard/user/inspections", label: "Inspections", icon: "🔍" },
      ],
    };
    return links[role] || links.client;
  };

  // Add common links (notifications and messages) to all roles
  const commonLinks = [
    { href: "/dashboard/user/notifications", label: "Notifications", icon: "🔔", badge: unreadCount },
    { href: "/dashboard/user/messages", label: "Messages", icon: "💬", badge: unreadMessagesCount },
  ];

  let dashboardLinks = getDashboardLinks();
  dashboardLinks = [...dashboardLinks, ...commonLinks];

  // Admin has a different layout (no sidebar)
  if (user.role === "admin") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/70">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-widest">
              HOMELOOP
            </Link>
            <div className="flex items-center gap-4">
              {/* Notification Bell for Admin */}
              <Link href="/dashboard/user/notifications" className="relative">
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              {/* Messages Icon for Admin */}
              <Link href="/dashboard/user/messages" className="relative">
                <span className="text-xl">💬</span>
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                    {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                  </span>
                )}
              </Link>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.firstName} {user?.lastName} (Admin)
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    );
  }

  // Regular user dashboard layout with sidebar
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen p-6">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-bold tracking-widest block mb-4">
              HOMELOOP
            </Link>
            <h2 className="text-xl font-bold">Dashboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 capitalize mt-1">
              {user.role.replace("_", " ")}
            </p>
          </div>
          
          <nav className="space-y-2">
            {dashboardLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {link.badge > 9 ? "9+" : link.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <span className="text-xl">👤</span>
                <span>My Profile</span>
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-red-600"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
