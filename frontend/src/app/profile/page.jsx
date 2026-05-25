"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/users/me");
      setProfileData(response.data.user || response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!profileData) return null;

  const getDashboardLink = () => {
    const role = profileData.role;
    const links = {
      admin: "/admin/dashboard",
      landlord: "/dashboard/landlord",
      service_provider: "/dashboard/service-provider",
      representative: "/dashboard/representative",
      client: "/dashboard/user",
    };
    return links[role] || "/dashboard/user";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={getDashboardLink()}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">@{profileData.username}</p>
              <p className="text-gray-600 dark:text-gray-400">{profileData.email}</p>
              <p className="text-sm text-gray-500 mt-2 capitalize">
                Role: {profileData.role === "service_provider" ? "Service Provider" : profileData.role}
              </p>
            </div>
            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm">Member Since</h3>
            <p className="text-lg font-semibold mt-2">
              {new Date(profileData.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm">Last Login</h3>
            <p className="text-lg font-semibold mt-2">
              {profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm">Email Verified</h3>
            <p className="text-lg font-semibold mt-2">
              {profileData.isEmailVerified ? "✓ Yes" : "✗ No"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p>{profileData.email}</p>
            </div>
            {profileData.phoneNumber && (
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p>{profileData.phoneNumber}</p>
              </div>
            )}
            {profileData.address && (
              <div>
                <p className="text-gray-500 text-sm">Address</p>
                <p>
                  {profileData.address}
                  {profileData.city && `, ${profileData.city}`}
                  {profileData.state && `, ${profileData.state}`}
                  {profileData.country && `, ${profileData.country}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
