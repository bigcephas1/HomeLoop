"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LandlordPropertiesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "landlord")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "landlord") {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/properties?page=1&limit=50");
      const allProperties = response.data.properties || [];
      // Filter properties by the logged-in landlord
      const myProperties = allProperties.filter(property => 
        property.landlord?._id === user._id || property.landlord === user._id
      );
      setProperties(myProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/properties/${propertyId}`);
      toast.success("Property deleted successfully");
      fetchProperties();
    } catch (error) {
      toast.error("Failed to delete property");
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
        <h1 className="text-3xl font-bold">My Properties</h1>
        <Link
          href="/dashboard/landlord/properties/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add New Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-xl font-semibold mb-2">No Properties Yet</h2>
          <p className="text-gray-500 mb-4">
            You haven't listed any properties yet. Click the button above to add your first property.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property._id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-200 dark:bg-gray-700">
                {property.media?.[0]?.url ? (
                  <img src={property.media[0].url} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{property.city}, {property.state}</p>
                <p className="text-blue-600 font-bold mb-2">₦{property.price?.toLocaleString()}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    property.moderationStatus === "approved" ? "bg-green-100 text-green-800" :
                    property.moderationStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {property.moderationStatus || "pending"}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{property.purpose}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/landlord/properties/${property._id}/edit`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(property._id)}
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
