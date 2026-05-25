"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-xl font-semibold mb-2">Messages Coming Soon</h2>
        <p className="text-gray-500 mb-4">
          The messaging feature is currently under development.
        </p>
        <Link
          href="/dashboard/service-provider"
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
