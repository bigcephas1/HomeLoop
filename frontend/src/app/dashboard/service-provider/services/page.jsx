"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ServiceProviderServicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "service_provider")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "service_provider") {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/services?page=1&limit=50");
      // Filter services by the logged-in provider
      const allServices = response.data.services || [];
      const myServices = allServices.filter(service => service.provider?._id === user._id || service.provider === user._id);
      setServices(myServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    try {
      await api.delete(`/services/${serviceId}`);
      toast.success("Service deleted successfully");
      fetchServices();
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Services</h1>
        <Link
          href="/dashboard/service-provider/services/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add New Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🛠️</div>
          <h2 className="text-xl font-semibold mb-2">No Services Yet</h2>
          <p className="text-gray-500 mb-4">
            You haven't created any services yet. Click the button above to add your first service.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service._id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                  {service.description}
                </p>
                <p className="text-blue-600 font-bold text-xl mb-2">
                  ₦{service.price?.toLocaleString()}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500 capitalize">{service.category}</span>
                  <span className="text-sm text-gray-500">{service.duration} mins</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/service-provider/services/${service._id}/edit`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
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
