"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ServiceProviderBookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loading && (!user || user.role !== "service_provider")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "service_provider") {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/service-bookings/my-bookings");
      let allBookings = Array.isArray(response.data) ? response.data : response.data.bookings || [];
      setBookings(allBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoadingData(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await api.patch(`/service-bookings/${bookingId}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getFilteredBookings = () => {
    if (filter === "all") return bookings;
    return bookings.filter(b => b.status === filter);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Service Bookings</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold mb-2">No Bookings Found</h2>
          <p className="text-gray-500">
            {filter === "all" 
              ? "You don't have any service bookings yet."
              : `No ${filter} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {booking.serviceId?.title || "Service Booking"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Client: {booking.clientId?.firstName} {booking.clientId?.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Date: {new Date(booking.scheduledDate).toLocaleString()}
                  </p>
                  {booking.notes && (
                    <p className="text-sm text-gray-500 mt-2">
                      Notes: {booking.notes}
                    </p>
                  )}
                </div>
                <div>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              {booking.status === "pending" && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => updateStatus(booking._id, "confirmed")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => updateStatus(booking._id, "cancelled")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}

              {booking.status === "confirmed" && (
                <div className="mt-4">
                  <button
                    onClick={() => updateStatus(booking._id, "completed")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
