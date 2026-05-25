"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    scheduledDate: "",
    notes: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${id}`);
      setService(response.data);
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error("Service not found");
      router.push("/services");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to book");
      router.push("/login");
      return;
    }

    try {
      setBookingLoading(true);
      await api.post("/service-bookings", {
        serviceId: id,
        scheduledDate: bookingData.scheduledDate,
        notes: bookingData.notes,
      });
      toast.success("Service booked successfully");
      setShowBookingModal(false);
      router.push("/dashboard/user/service-bookings");
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const startConversation = async () => {
    if (!user) {
      toast.error("Please login to message provider");
      router.push("/login");
      return;
    }

    try {
      const response = await api.post("/messages/conversations", {
        participantId: service.provider?._id,
      });
      router.push(`/dashboard/user/messages?conversation=${response.data._id}`);
    } catch (error) {
      toast.error("Failed to start conversation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm capitalize">
                  {service.category}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {service.availability}
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-4">
                ₦{service.price?.toLocaleString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Duration: {service.duration} minutes
              </p>
              <h2 className="text-xl font-semibold mb-2 mt-6">Description</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {service.description}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Service Provider</h3>
              <div className="mb-4">
                <p className="font-medium">{service.provider?.firstName} {service.provider?.lastName}</p>
                <p className="text-gray-500 text-sm">{service.provider?.email}</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                >
                  Book This Service
                </button>
                <button
                  onClick={startConversation}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Message Provider
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Book Service</h2>
            <form onSubmit={handleBooking}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingData.scheduledDate}
                  onChange={(e) => setBookingData({ ...bookingData, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  rows="3"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  placeholder="Any special requests or instructions..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  {bookingLoading ? "Processing..." : "Confirm Booking"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
