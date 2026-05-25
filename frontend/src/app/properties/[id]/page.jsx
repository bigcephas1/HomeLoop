"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import ReviewSection from "@/components/ReviewSection";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [propertyNotFound, setPropertyNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  useEffect(() => {
    if (user && property && !propertyNotFound) {
      checkFavorite();
    }
  }, [user, property]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setPropertyNotFound(false);
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error("Error fetching property:", error);
      if (error.response?.status === 404) {
        setPropertyNotFound(true);
        toast.error("Property not found or has been removed");
      } else {
        toast.error("Failed to load property details");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await api.get("/favorites");
      let favorites = [];
      if (Array.isArray(response.data)) {
        favorites = response.data;
      } else if (response.data.favorites) {
        favorites = response.data.favorites;
      } else if (response.data.data) {
        favorites = response.data.data;
      }
      
      const favorite = favorites.find(fav => {
        const favPropertyId = fav.property?._id || fav.property;
        return favPropertyId === id;
      });
      
      setIsFavorite(!!favorite);
      if (favorite) {
        setFavoriteId(favorite._id);
        console.log("Found favorite with ID:", favorite._id);
      } else {
        setFavoriteId(null);
      }
    } catch (error) {
      console.error("Error checking favorite:", error);
      setIsFavorite(false);
      setFavoriteId(null);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please login to save favorites");
      router.push("/login");
      return;
    }

    if (propertyNotFound) {
      toast.error("Cannot favorite a property that doesn't exist");
      return;
    }

    try {
      if (isFavorite) {
        console.log("Removing favorite for property ID:", id);
        await api.delete(`/favorites/${id}`);
        toast.success("Removed from favorites");
        setIsFavorite(false);
        setFavoriteId(null);
        window.dispatchEvent(new Event("favoritesUpdated"));
      } else {
        console.log("Adding favorite for property:", id);
        const response = await api.post(`/favorites/${id}`, { propertyId: id });
        toast.success("Added to favorites");
        setIsFavorite(true);
        if (response.data && response.data._id) {
          setFavoriteId(response.data._id);
        }
        window.dispatchEvent(new Event("favoritesUpdated"));
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes("already")) {
          toast.info("Property already in favorites");
          setIsFavorite(true);
          await checkFavorite();
        } else {
          toast.error("Unable to add to favorites");
        }
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
      } else if (error.response?.status === 404) {
        if (!isFavorite) {
          toast.error("Property not found");
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
          toast.success("Removed from favorites");
        }
      } else {
        toast.error("Failed to update favorites");
      }
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to book");
      router.push("/login");
      return;
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      setBookingLoading(true);
      await api.post(`/bookings/${id}`, {
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
      });
      toast.success("Booking request sent successfully");
      setShowBookingModal(false);
      setBookingData({ startDate: "", endDate: "" });
      router.push("/dashboard/user/bookings");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const startConversation = async () => {
    if (!user) {
      toast.error("Please login to message landlord");
      router.push("/login");
      return;
    }

    if (!property || propertyNotFound) {
      toast.error("Cannot start conversation for this property");
      return;
    }

    try {
      const response = await api.post("/messages/conversations", {
        participantId: property.landlord?._id,
        propertyId: id,
      });
      toast.success("Conversation started");
      router.push(`/dashboard/user/messages?conversation=${response.data._id}`);
    } catch (error) {
      console.error("Conversation error:", error);
      toast.error("Failed to start conversation");
    }
  };

  const getBackLink = () => {
    if (!user) return "/properties";
    const role = user.role;
    const links = {
      admin: "/admin/dashboard",
      landlord: "/dashboard/landlord",
      service_provider: "/dashboard/service-provider",
      representative: "/dashboard/representative",
      client: "/dashboard/user",
    };
    return links[role] || "/dashboard/user";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading property details...</div>
      </div>
    );
  }

  if (propertyNotFound || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-8xl mb-4">🏠❌</div>
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-gray-500 mb-6">
            The property you're looking for doesn't exist, has been removed, or you may have entered an invalid link.
          </p>
          <div className="space-y-3">
            <Link
              href={getBackLink()}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              ← Back to Dashboard
            </Link>
            <div>
              <Link
                href="/properties"
                className="inline-block text-blue-600 hover:underline"
              >
                Browse Other Properties →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={getBackLink()}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Property Images */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
          <div className="h-96 bg-gray-300 dark:bg-gray-700">
            {property.media?.[0]?.url ? (
              <img
                src={property.media[0].url}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <button
                  onClick={toggleFavorite}
                  className="text-2xl hover:scale-110 transition transform"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? "❤️" : "🤍"}
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {property.address}, {property.city}, {property.state}
              </p>
              <p className="text-3xl font-bold text-blue-600 mb-4">
                ₦{property.price?.toLocaleString()}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm capitalize">
                  {property.purpose}
                </span>
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm capitalize">
                  {property.type}
                </span>
                {property.status && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {property.status}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Property Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {property.bedrooms > 0 && (
                  <div>
                    <p className="text-gray-500">Bedrooms</p>
                    <p className="font-semibold">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div>
                    <p className="text-gray-500">Bathrooms</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                )}
                {property.parkingSpaces > 0 && (
                  <div>
                    <p className="text-gray-500">Parking Spaces</p>
                    <p className="font-semibold">{property.parkingSpaces}</p>
                  </div>
                )}
                {property.size > 0 && (
                  <div>
                    <p className="text-gray-500">Size</p>
                    <p className="font-semibold">{property.size} {property.sizeUnit || 'sqm'}</p>
                  </div>
                )}
              </div>

              {property.amenities?.length > 0 && (
                <>
                  <h3 className="font-semibold mt-4 mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Reviews Section - MOVED OUTSIDE SIDEBAR */}
            <ReviewSection propertyId={id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Contact Landlord</h3>
              <div className="mb-4">
                <p className="font-medium">{property.landlord?.firstName} {property.landlord?.lastName}</p>
                <p className="text-gray-500 text-sm">{property.landlord?.email}</p>
              </div>
              <div className="space-y-3">
                {(property.purpose === "rent" || property.purpose === "shortlet") && (
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    Book Now
                  </button>
                )}
                <button
                  onClick={startConversation}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Message Landlord
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Book Property</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleBooking}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  required
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  required
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {bookingLoading ? "Processing..." : "Confirm Booking"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
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
