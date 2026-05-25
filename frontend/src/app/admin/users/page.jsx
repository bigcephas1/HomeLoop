"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/recent-users");
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    const reason = prompt("Enter suspension reason:");
    if (reason) {
      try {
        await api.patch(`/admin/users/suspend/${userId}`, { reason });
        toast.success("User suspended");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to suspend user");
      }
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await api.patch(`/admin/users/activate/${userId}`);
      toast.success("User activated");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to activate user");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">User Management</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((userItem) => (
                  <tr key={userItem._id}>
                    <td className="px-6 py-4">
                      {userItem.firstName} {userItem.lastName}
                    </td>
                    <td className="px-6 py-4">{userItem.email}</td>
                    <td className="px-6 py-4 capitalize">{userItem.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        userItem.isSuspended ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {userItem.isSuspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(userItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      {userItem.isSuspended ? (
                        <button
                          onClick={() => handleActivateUser(userItem._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspendUser(userItem._id)}
                          className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
