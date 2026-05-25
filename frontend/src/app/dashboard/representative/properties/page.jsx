"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function RepresentativePropertiesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "representative")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "representative") {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/properties?limit=20");
      const propertiesList = response.data.properties || [];
      setProperties(propertiesList);
      setIsVerified(true);
    } catch (error) {
      console.error("Error fetching properties:", error);
      
      if (error.response?.status === 403) {
        setIsVerified(false);
        setProperties([
          {
            _id: "mock1",
            title: "Luxury Apartment in Victoria Island",
            price: 350000,
            city: "Lagos",
            state: "Lagos",
            type: "house",
            purpose: "rent",
          },
          {
            _id: "mock2",
            title: "3-Bedroom House in Lekki",
            price: 500000,
            city: "Lagos",
            state: "Lagos",
            type: "house",
            purpose: "rent",
          },
        ]);
        toast.info("Demo mode: Complete verification to see real property data");
      } else {
        toast.error("Failed to load properties");
      }
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Verification Required</h2>
          <p className="text-gray-500 mb-4">
            You need to verify your representative account to view properties.
          </p>
          <button
            onClick={() => router.push("/dashboard/representative/credibility")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Verification Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Properties for Inspection</h1>

      {properties.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-xl font-semibold mb-2">No Properties Available</h2>
          <p className="text-gray-500">
            Properties will appear here when landlords list them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property._id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="h-40 bg-gray-200 dark:bg-gray-700">
                {property.media?.[0]?.url ? (
                  <img src={property.media[0].url} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{property.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{property.city}, {property.state}</p>
                <p className="text-blue-600 font-bold mb-2">₦{property.price?.toLocaleString()}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 capitalize">{property.purpose}</span>
                  <Link href={`/properties/${property._id}`} className="text-blue-600 text-sm">
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
