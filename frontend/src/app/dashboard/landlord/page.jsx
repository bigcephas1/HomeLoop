"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function LandlordDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    properties: 0,
    activeListings: 0,
    totalBookings: 0,
    pendingReviews: 0,
  });
  const [properties, setProperties] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "landlord")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "landlord") {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      
      try {
        const profileRes = await api.get("/provider-profiles/me");
        setProfile(profileRes.data);
      } catch (error) {
        console.log("No provider profile yet");
        setProfile(null);
      }
      
      try {
        const propertiesRes = await api.get("/properties?page=1&limit=10");
        const propertiesList = propertiesRes.data.properties || [];
        const myProperties = propertiesList.filter(property => 
          property.landlord?._id === user._id || property.landlord === user._id
        );
        setProperties(myProperties);
        setStats(prev => ({
          ...prev,
          properties: myProperties.length,
          activeListings: myProperties.filter(p => p.moderationStatus === "approved").length,
        }));
      } catch (error) {
        console.log("Properties endpoint not ready");
      }
      
      try {
        const bookingsRes = await api.get("/bookings/landlord");
        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.bookings || [];
        setStats(prev => ({ ...prev, totalBookings: bookings.length }));
        setRecentBookings(bookings.slice(0, 5));
      } catch (error) {
        console.log("Bookings endpoint not ready");
      }
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const createProfile = async () => {
    try {
      const response = await api.post("/provider-profiles", {
        providerTypes: ["landlord"],
        bio: "Experienced landlord with multiple properties",
        yearsOfExperience: 1,
        skills: ["property management", "tenant relations"],
        phoneNumber: "+2348000000000"
      });
      
      if (response.data.requiresVerification) {
        toast.success("Profile created! Please wait for admin verification.");
      } else {
        toast.success("Profile created successfully");
      }
      
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create profile");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  // No profile - show create profile button
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Landlord Dashboard</h2>
          <p className="text-gray-500 mb-6">Create your landlord profile to start listing properties</p>
          <button
            onClick={createProfile}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Create Landlord Profile
          </button>
        </div>
      </div>
    );
  }

  // Profile pending approval - show waiting message
  if (profile.verificationStatus === "pending") {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-2">Profile Pending Approval</h2>
          <p className="text-gray-500 mb-4">
            Your landlord profile has been created and is waiting for admin verification.
          </p>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You will be notified once your profile is approved. This usually takes 24-48 hours.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/dashboard/landlord/credibility"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Upload Verification Documents
            </Link>
            <p className="text-xs text-gray-400">
              Uploading documents helps speed up the verification process
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Profile rejected - show rejection message
  if (profile.verificationStatus === "rejected") {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Profile Verification Rejected</h2>
          <p className="text-gray-500 mb-4">
            Your landlord profile verification was rejected.
          </p>
          {profile.rejectionReason && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                Reason: {profile.rejectionReason}
              </p>
            </div>
          )}
          <Link
            href="/dashboard/landlord/credibility"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Resubmit Documents
          </Link>
        </div>
      </div>
    );
  }

  // Show suspended message
  if (profile.isSuspended) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Account Suspended</h2>
          <p className="text-gray-500 mb-6">{profile.suspensionReason || "Contact support for more information"}</p>
        </div>
      </div>
    );
  }

  // Profile approved - show full dashboard
  return (
    <div>
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}! 🏠
        </h1>
        <p className="text-green-100">
          Manage your properties and track bookings
        </p>
        {profile.verificationStatus === "approved" && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-600 rounded-full text-sm">
            <span>✓</span> Verified Landlord
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Properties</h3>
            <span className="text-2xl">🏠</span>
          </div>
          <p className="text-3xl font-bold">{stats.properties}</p>
          <Link href="/dashboard/landlord/properties" className="text-blue-600 text-sm mt-2 inline-block">
            Manage →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Active Listings</h3>
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-3xl font-bold">{stats.activeListings}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Bookings</h3>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalBookings}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Pending Reviews</h3>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-3xl font-bold">{stats.pendingReviews}</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Properties</h2>
          {profile.verificationStatus === "approved" && (
            <Link href="/dashboard/landlord/properties/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              + Add New
            </Link>
          )}
        </div>
        
        {properties.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500">No properties yet.</p>
            {profile.verificationStatus === "approved" && (
              <Link href="/dashboard/landlord/properties/create" className="inline-block mt-2 text-blue-600 hover:underline">
                Create your first property →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 3).map((property) => (
              <div key={property._id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
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
                  <p className="text-sm text-gray-500 mb-2">₦{property.price?.toLocaleString()}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      property.moderationStatus === "approved" ? "bg-green-100 text-green-800" :
                      property.moderationStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {property.moderationStatus || "pending"}
                    </span>
                    <Link href={`/dashboard/landlord/properties/${property._id}/edit`} className="text-blue-600 text-sm">
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {profile.verificationStatus === "approved" && (
          <Link
            href="/dashboard/landlord/properties/create"
            className="bg-blue-600 text-white p-4 rounded-xl text-center hover:bg-blue-700 transition"
          >
            + List New Property
          </Link>
        )}
        <Link
          href="/dashboard/landlord/properties"
          className="bg-gray-600 text-white p-4 rounded-xl text-center hover:bg-gray-700 transition"
        >
          Manage Properties
        </Link>
        <Link
          href="/dashboard/landlord/bookings"
          className="bg-purple-600 text-white p-4 rounded-xl text-center hover:bg-purple-700 transition"
        >
          View Bookings
        </Link>
        <Link
          href="/dashboard/landlord/tenants"
          className="bg-green-600 text-white p-4 rounded-xl text-center hover:bg-green-700 transition"
        >
          View Tenants
        </Link>
        <Link
          href="/dashboard/landlord/payments"
          className="bg-orange-600 text-white p-4 rounded-xl text-center hover:bg-orange-700 transition"
        >
          View Payments
        </Link>
      </div>
    </div>
  );
}
