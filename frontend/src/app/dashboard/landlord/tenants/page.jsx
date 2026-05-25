"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function LandlordTenantsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tenants, setTenants] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "landlord")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "landlord") {
      fetchTenants();
    }
  }, [user]);

  const fetchTenants = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/bookings/landlord");
      const bookings = Array.isArray(response.data) ? response.data : response.data.bookings || [];
      
      // Extract unique tenants from completed bookings
      const uniqueTenants = [];
      const tenantMap = new Map();
      
      bookings.forEach(booking => {
        if (booking.status === "completed" && booking.user && !tenantMap.has(booking.user._id)) {
          tenantMap.set(booking.user._id, booking.user);
          uniqueTenants.push({
            ...booking.user,
            propertyCount: bookings.filter(b => b.user?._id === booking.user._id).length,
            lastBooking: new Date(Math.max(...bookings.filter(b => b.user?._id === booking.user._id).map(b => new Date(b.createdAt))))
          });
        }
      });
      
      setTenants(uniqueTenants);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      setTenants([]);
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Tenants</h1>

      {tenants.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-xl font-semibold mb-2">No Tenants Yet</h2>
          <p className="text-gray-500">
            When clients complete bookings on your properties, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <div key={tenant._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {tenant.firstName?.charAt(0)}{tenant.lastName?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {tenant.firstName} {tenant.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{tenant.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  📅 Bookings: {tenant.propertyCount}
                </p>
                {tenant.lastBooking && (
                  <p className="text-gray-600 dark:text-gray-400">
                    🕐 Last: {new Date(tenant.lastBooking).toLocaleDateString()}
                  </p>
                )}
                {tenant.phoneNumber && (
                  <p className="text-gray-600 dark:text-gray-400">
                    📞 {tenant.phoneNumber}
                  </p>
                )}
              </div>
              <button
                onClick={() => toast.info("Messaging coming soon")}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Message Tenant
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
