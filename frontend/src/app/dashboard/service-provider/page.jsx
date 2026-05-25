"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";
import CredibilityScore from "@/components/CredibilityScore";

export default function ServiceProviderDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    services: 0,
    activeBookings: 0,
    completedJobs: 0,
    totalEarnings: 0,
  });
  const [services, setServices] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "service_provider")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "service_provider") {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      
      // Get provider profile
      try {
        const profileRes = await api.get("/provider-profiles/me");
        setProfile(profileRes.data);
        // Update user credibility score
        if (profileRes.data.credibilityScore) {
          user.credibilityScore = profileRes.data.credibilityScore;
        }
      } catch (error) {
        console.log("No provider profile yet");
      }
      
      // Get services
      try {
        const servicesRes = await api.get("/services?page=1&limit=10");
        const servicesList = servicesRes.data.services || [];
        setServices(servicesList);
        setStats(prev => ({ ...prev, services: servicesList.length }));
      } catch (error) {
        console.log("Services endpoint not ready");
      }
      
      // Get bookings
      try {
        const bookingsRes = await api.get("/service-bookings/my-bookings");
        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.bookings || [];
        setStats(prev => ({
          ...prev,
          activeBookings: bookings.filter(b => b.status === "confirmed").length,
          completedJobs: bookings.filter(b => b.status === "completed").length,
        }));
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
      await api.post("/provider-profiles", {
        providerTypes: ["service_provider"],
        bio: "Professional service provider",
        yearsOfExperience: 1,
        skills: ["cleaning", "repairs", "maintenance"],
        phoneNumber: "+2348000000000"
      });
      toast.success("Profile created successfully");
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to create profile");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  // Show profile creation prompt if no profile
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🛠️</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Service Provider Dashboard</h2>
          <p className="text-gray-500 mb-6">Create your profile to start offering services</p>
          <button
            onClick={createProfile}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Create Service Provider Profile
          </button>
        </div>
      </div>
    );
  }

  // Show pending verification message
  if (profile.verificationStatus === "pending") {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-2">Profile Under Review</h2>
          <p className="text-gray-500 mb-6">
            Your profile is pending verification. You'll be notified once approved.
          </p>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm">Upload documents to speed up verification</p>
            <Link href="/dashboard/service-provider/credibility" className="text-blue-600 text-sm mt-2 inline-block">
              Upload Documents →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section with Credibility Score */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}! 🛠️
            </h1>
            <p className="text-orange-100">
              Manage your services and track bookings
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <CredibilityScore score={profile?.credibilityScore || 0} size="small" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">My Services</h3>
            <span className="text-2xl">🛠️</span>
          </div>
          <p className="text-3xl font-bold">{stats.services}</p>
          <Link href="/dashboard/service-provider/services" className="text-blue-600 text-sm mt-2 inline-block">
            Manage →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Active Bookings</h3>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-3xl font-bold">{stats.activeBookings}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Completed Jobs</h3>
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-3xl font-bold">{stats.completedJobs}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Earnings</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold">₦{stats.totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      {/* My Services */}
      {services.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Services</h2>
            <Link href="/dashboard/service-provider/services/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              + Add New
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 3).map((service) => (
              <div key={service._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold mb-1">{service.title}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{service.description}</p>
                <p className="text-blue-600 font-bold mb-2">₦{service.price?.toLocaleString()}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 capitalize">{service.category}</span>
                  <Link href={`/dashboard/service-provider/services/${service._id}/edit`} className="text-blue-600 text-sm">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/service-provider/services/create"
          className="bg-blue-600 text-white p-4 rounded-xl text-center hover:bg-blue-700 transition"
        >
          + Add New Service
        </Link>
        <Link
          href="/dashboard/service-provider/credibility"
          className="bg-purple-600 text-white p-4 rounded-xl text-center hover:bg-purple-700 transition"
        >
          Improve Credibility
        </Link>
        <Link
          href="/dashboard/service-provider/bookings"
          className="bg-green-600 text-white p-4 rounded-xl text-center hover:bg-green-700 transition"
        >
          View Bookings
        </Link>
      </div>
    </div>
  );
}
