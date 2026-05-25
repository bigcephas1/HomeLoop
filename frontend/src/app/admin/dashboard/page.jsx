"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Only redirect if not loading and user is null (not admin)
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/admin/login");
      } else if (user.role !== "admin") {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      
      try {
        const dashboardRes = await api.get("/admin/dashboard");
        setDashboardData(dashboardRes.data);
      } catch (error) {
        console.log("Dashboard endpoint not ready yet");
      }
      
      try {
        const usersRes = await api.get("/admin/recent-users");
        setRecentUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      } catch (error) {
        console.log("Recent users endpoint not ready yet");
        setRecentUsers([]);
      }
      
      try {
        const bookingsRes = await api.get("/admin/recent-bookings");
        setRecentBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      } catch (error) {
        console.log("Recent bookings endpoint not ready yet");
        setRecentBookings([]);
      }
      
      try {
        const providersRes = await api.get("/admin/providers?verificationStatus=pending");
        setPendingProviders(Array.isArray(providersRes.data) ? providersRes.data : []);
      } catch (error) {
        console.log("Providers endpoint not ready yet");
        setPendingProviders([]);
      }
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load some dashboard data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleApproveProvider = async (profileId) => {
    try {
      await api.patch(`/admin/providers/approve/${profileId}`);
      toast.success("Provider approved successfully");
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to approve provider");
    }
  };

  const handleRejectProvider = async (profileId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await api.patch(`/admin/providers/reject/${profileId}`, { reason });
        toast.success("Provider rejected");
        fetchDashboardData();
      } catch (error) {
        toast.error("Failed to reject provider");
      }
    }
  };

  // Show loading state
  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // If no user after loading, return null (will redirect via useEffect)
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user.firstName} {user.lastName}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{dashboardData.totalUsers}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Properties</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{dashboardData.totalProperties}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{dashboardData.totalBookings}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Verifications</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{pendingProviders.length}</p>
          </div>
        </div>

        {/* Pending Provider Verifications */}
        {pendingProviders.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold">Pending Provider Verifications</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {pendingProviders.map((provider) => (
                    <tr key={provider._id}>
                      <td className="px-6 py-4">{provider.userId?.firstName} {provider.userId?.lastName}</td>
                      <td className="px-6 py-4 capitalize">{provider.providerTypes?.join(", ")}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleApproveProvider(provider._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectProvider(provider._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                       </td>
                     </tr>
                  ))}
                </tbody>
               </table>
            </div>
          </div>
        )}

        {/* Recent Users */}
        {recentUsers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold">Recent Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentUsers.map((userItem) => (
                    <tr key={userItem._id}>
                      <td className="px-6 py-4">{userItem.firstName} {userItem.lastName}</td>
                      <td className="px-6 py-4">{userItem.email}</td>
                      <td className="px-6 py-4 capitalize">{userItem.role}</td>
                     </tr>
                  ))}
                </tbody>
               </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
