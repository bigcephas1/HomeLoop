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
  const [stats, setStats] = useState({
    properties: 0,
    bookings: 0,
    reviews: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      if (user.role === "landlord") {
        const propertiesRes = await api.get("/properties?page=1&limit=1");
        setStats(prev => ({ ...prev, properties: propertiesRes.data.total || 0 }));
      }
      const bookingsRes = await api.get("/bookings/user?page=1&limit=1");
      setStats(prev => ({ ...prev, bookings: bookingsRes.data.total || 0 }));
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">@{user.username}</p>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 mt-2 capitalize">Role: {user.role}</p>
            </div>
            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {user.role === "landlord" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <h3 className="text-gray-500 text-sm">Properties Listed</h3>
              <p className="text-3xl font-bold mt-2">{stats.properties}</p>
            </div>
          )}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm">Total Bookings</h3>
            <p className="text-3xl font-bold mt-2">{stats.bookings}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm">Member Since</h3>
            <p className="text-lg font-semibold mt-2">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p>{user.email}</p>
            </div>
            {user.phoneNumber && (
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p>{user.phoneNumber}</p>
              </div>
            )}
            {user.address && (
              <div>
                <p className="text-gray-500 text-sm">Address</p>
                <p>{user.address}, {user.city}, {user.state}, {user.country}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
