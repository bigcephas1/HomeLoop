"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function RepresentativeDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "representative")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "representative") {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/provider-profiles/me");
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setLoadingData(false);
    }
  };

  const createProfile = async () => {
    try {
      await api.post("/provider-profiles", {
        providerTypes: ["representative"],
        bio: "Professional property inspection guide",
        yearsOfExperience: 1,
        skills: ["property tours", "security escort", "local knowledge"],
        phoneNumber: "+2348000000000"
      });
      toast.success("Profile created successfully! Please upload verification documents.");
      fetchProfile();
    } catch (error) {
      toast.error("Failed to create profile");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // No profile - show create profile button
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Representative Dashboard</h2>
          <p className="text-gray-500 mb-6">Create your representative profile to start offering inspection services</p>
          <button
            onClick={createProfile}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Create Representative Profile
          </button>
        </div>
      </div>
    );
  }

  // Profile exists but not verified - show verification required message
  if (profile.verificationStatus === "not_submitted" || profile.verificationStatus === "pending") {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Verification Required</h2>
          <p className="text-gray-500 mb-4">
            Your representative profile needs to be verified before you can accept inspection requests.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please upload your verification documents and submit for review.
            </p>
          </div>
          <Link
            href="/dashboard/representative/credibility"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 inline-block"
          >
            Upload Documents & Verify
          </Link>
        </div>
      </div>
    );
  }

  // Profile rejected - show rejection reason
  if (profile.verificationStatus === "rejected") {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Verification Rejected</h2>
          <p className="text-gray-500 mb-4">
            Your profile verification was rejected.
          </p>
          {profile.rejectionReason && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
              <p className="text-sm text-red-800 dark:text-red-200">
                Reason: {profile.rejectionReason}
              </p>
            </div>
          )}
          <Link
            href="/dashboard/representative/credibility"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 inline-block"
          >
            Resubmit Documents
          </Link>
        </div>
      </div>
    );
  }

  // Profile verified - show full dashboard
  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}! 🔍
        </h1>
        <p className="text-purple-100">
          Manage property inspections and assist clients
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-600 rounded-full text-sm">
          <span>✓</span> Verified Representative
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Pending Inspections</h3>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Completed</h3>
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Clients</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Rating</h3>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-3xl font-bold">0.0</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/representative/inspections"
          className="bg-blue-600 text-white p-4 rounded-xl text-center hover:bg-blue-700 transition"
        >
          View Inspections
        </Link>
        <Link
          href="/dashboard/representative/schedule"
          className="bg-purple-600 text-white p-4 rounded-xl text-center hover:bg-purple-700 transition"
        >
          Manage Schedule
        </Link>
      </div>
    </div>
  );
}
