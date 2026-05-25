"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminServices() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/services?limit=100");
      setServices(response.data.services || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSuspend = async (serviceId) => {
    const reason = prompt("Enter suspension reason:");
    if (reason) {
      try {
        await api.patch(`/admin/services/suspend/${serviceId}`, { reason });
        toast.success("Service suspended");
        fetchServices();
      } catch (error) {
        toast.error("Failed to suspend service");
      }
    }
  };

  const handleActivate = async (serviceId) => {
    try {
      await api.patch(`/admin/services/activate/${serviceId}`);
      toast.success("Service activated");
      fetchServices();
    } catch (error) {
      toast.error("Failed to activate service");
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
        <h1 className="text-3xl font-bold mb-8">Service Management</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {services.map((service) => (
                  <tr key={service._id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{service.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {service.provider?.firstName} {service.provider?.lastName}
                    </td>
                    <td className="px-6 py-4 capitalize">{service.category}</td>
                    <td className="px-6 py-4">₦{service.price?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        service.isPublished ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {service.isPublished ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      {service.isPublished ? (
                        <button
                          onClick={() => handleSuspend(service._id)}
                          className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(service._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Activate
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
