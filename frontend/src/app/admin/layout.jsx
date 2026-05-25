"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === "/admin/login") {
      return;
    }
    
    if (!loading && !user) {
      router.push("/admin/login");
    } else if (!loading && user && user.role !== "admin") {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <a href="/admin/dashboard" className="text-2xl font-bold tracking-widest">
            HOMELOOP ADMIN
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex">
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen p-6">
          <nav className="space-y-2">
            <a href="/admin/dashboard" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              📊 Dashboard
            </a>
            <a href="/admin/users" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              👥 Users
            </a>
            <a href="/admin/providers" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              🔧 Providers
            </a>
            <a href="/admin/properties" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              🏠 Properties
            </a>
            <a href="/admin/services" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              🛠️ Services
            </a>
            <a href="/admin/reports" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              📈 Reports
            </a>
          </nav>
        </aside>
        
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
