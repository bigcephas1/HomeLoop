"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function LandlordBookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loading && (!user || user.role !== "landlord")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "landlord") {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/bookings/landlord");
      let allBookings = Array.isArray(response.data) ? response.data : response.data.bookings || [];
      setBookings(allBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoadingData(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/status/${bookingId}`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (error) {
      toast.error("Failed to update booking status");
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
      <h1 className="text-3xl font-bold mb-6">Property Bookings</h1>

      <div className="flex flex-wrap gap-2 mb-6">
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
              ? "You don't have any property bookings yet."
              : `No ${filter} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {booking.propertyId?.title || "Property"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Client: {booking.user?.firstName} {booking.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email: {booking.user?.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total: ₦{booking.totalPrice?.toLocaleString()}
                  </p>
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
                    onClick={() => updateBookingStatus(booking._id, "confirmed")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => updateBookingStatus(booking._id, "cancelled")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}

              {booking.status === "confirmed" && (
                <div className="mt-4">
                  <button
                    onClick={() => updateBookingStatus(booking._id, "completed")}
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
