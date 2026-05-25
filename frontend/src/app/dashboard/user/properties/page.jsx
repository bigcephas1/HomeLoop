"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function UserFavoritesPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoadingData(true);
      setAuthError(false);
      const response = await api.get("/favorites");
      let favData = [];
      if (Array.isArray(response.data)) {
        favData = response.data;
      } else if (response.data.favorites) {
        favData = response.data.favorites;
      } else if (response.data.data) {
        favData = response.data.data;
      }
      setFavorites(favData);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      
      if (error.response?.status === 401) {
        setAuthError(true);
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          logout();
          router.push("/login");
        }, 2000);
      } else if (error.response?.status === 404) {
        setFavorites([]);
      } else {
        toast.error("Failed to load favorites");
      }
    } finally {
      setLoadingData(false);
    }
  };

  const removeFavorite = async (favorite) => {
    // Use the favorite's _id from the database
    const favoriteId = favorite._id;
    
    console.log("Removing favorite with ID:", favoriteId);
    
    if (!favoriteId) {
      toast.error("Cannot remove favorite: Invalid entry");
      fetchFavorites();
      return;
    }

    try {
      await api.delete(`/favorites/${favoriteId}`);
      toast.success("Removed from favorites");
      // Remove from local state immediately
      setFavorites(prev => prev.filter(fav => fav._id !== favoriteId));
    } catch (error) {
      console.error("Remove favorite error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        router.push("/login");
      } else if (error.response?.status === 404) {
        // Remove from local state anyway
        setFavorites(prev => prev.filter(fav => fav._id !== favoriteId));
        toast.success("Removed from favorites");
      } else {
        toast.error("Failed to remove favorite");
      }
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Session Expired</h2>
          <p className="text-gray-500 mb-4">
            Your session has expired. Please log in again to continue.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Favorites</h1>
        <button
          onClick={fetchFavorites}
          className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Refresh
        </button>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-xl font-semibold mb-2">No Favorites Yet</h2>
          <p className="text-gray-500 mb-4">
            Start adding properties to your favorites to see them here.
          </p>
          <Link
            href="/properties"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            // The property might be populated or just an ID
            const property = favorite.property || favorite;
            const propertyId = property._id || favorite.property;
            const propertyTitle = property.title || "Property";
            const propertyCity = property.city || "Unknown";
            const propertyState = property.state || "";
            const propertyPrice = property.price || 0;
            const propertyImage = property.media?.[0]?.url || null;
            
            return (
              <div key={favorite._id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="h-48 bg-gray-200 dark:bg-gray-700">
                  {propertyImage ? (
                    <img src={propertyImage} alt={propertyTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{propertyTitle}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {propertyCity}, {propertyState}
                  </p>
                  <p className="text-blue-600 font-bold text-xl mb-2">
                    ₦{propertyPrice.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/properties/${propertyId}`}
                      className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => removeFavorite(favorite)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
