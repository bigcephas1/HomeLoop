"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    favorites: 0,
    propertyBookings: 0,
    serviceBookings: 0,
    inspections: 0,
  });
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "client") {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      
      // Get favorites count
      try {
        const favRes = await api.get("/favorites");
        const favorites = Array.isArray(favRes.data) ? favRes.data : favRes.data.favorites || [];
        setStats(prev => ({ ...prev, favorites: favorites.length }));
      } catch (error) {
        console.log("Favorites endpoint not ready");
      }
      
      // Get property bookings
      try {
        const bookingsRes = await api.get("/bookings/user");
        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.bookings || [];
        setStats(prev => ({ ...prev, propertyBookings: bookings.length }));
        setRecentBookings(bookings.slice(0, 5));
      } catch (error) {
        console.log("Bookings endpoint not ready");
      }
      
      // Get service bookings
      try {
        const serviceRes = await api.get("/service-bookings/my-bookings");
        const serviceBookings = Array.isArray(serviceRes.data) ? serviceRes.data : serviceRes.data.bookings || [];
        setStats(prev => ({ ...prev, serviceBookings: serviceBookings.length }));
      } catch (error) {
        console.log("Service bookings endpoint not ready");
      }
      
      // Get recent properties
      try {
        const propertiesRes = await api.get("/properties?limit=6");
        const properties = propertiesRes.data.properties || [];
        setRecentProperties(properties);
      } catch (error) {
        console.log("Properties endpoint not ready");
      }
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-blue-100">
          Discover your perfect property or service today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Saved Properties</h3>
            <span className="text-2xl">❤️</span>
          </div>
          <p className="text-3xl font-bold">{stats.favorites}</p>
          <Link href="/dashboard/user/favorites" className="text-blue-600 text-sm mt-2 inline-block">
            View all →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Property Bookings</h3>
            <span className="text-2xl">🏠</span>
          </div>
          <p className="text-3xl font-bold">{stats.propertyBookings}</p>
          <Link href="/dashboard/user/bookings" className="text-blue-600 text-sm mt-2 inline-block">
            View all →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Service Bookings</h3>
            <span className="text-2xl">🛠️</span>
          </div>
          <p className="text-3xl font-bold">{stats.serviceBookings}</p>
          <Link href="/dashboard/user/service-bookings" className="text-blue-600 text-sm mt-2 inline-block">
            View all →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Inspections</h3>
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-3xl font-bold">{stats.inspections}</p>
          <Link href="/dashboard/user/inspections" className="text-blue-600 text-sm mt-2 inline-block">
            View all →
          </Link>
        </div>
      </div>

      {/* Recent Properties */}
      {recentProperties.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Properties</h2>
            <Link href="/properties" className="text-blue-600 text-sm">
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProperties.map((property) => (
              <Link
                key={property._id}
                href={`/properties/${property._id}`}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
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
                  <h3 className="font-semibold mb-1 line-clamp-1">{property.title}</h3>
                  <p className="text-gray-500 text-sm mb-2">{property.city}, {property.state}</p>
                  <p className="text-blue-600 font-bold">₦{property.price?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{booking.propertyId?.title || "Property"}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                    booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          href="/properties"
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span className="text-xl">🔍</span>
          <span className="hidden sm:inline">Find Property</span>
        </Link>
      </div>
    </div>
  );
}
