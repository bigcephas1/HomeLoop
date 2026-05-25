"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function RepresentativeDealsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "representative")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "representative") {
      fetchDeals();
    }
  }, [user]);

  const fetchDeals = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/representative-inspections/representative/inspections");
      const inspections = Array.isArray(response.data) ? response.data : response.data.inspections || [];
      const completedDeals = inspections.filter(i => i.status === "completed");
      setDeals(completedDeals);
      setIsVerified(true);
    } catch (error) {
      console.error("Error fetching deals:", error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        setIsVerified(false);
        setDeals([]);
        toast.error("Please login again to view deals");
      } else {
        toast.error("Failed to load deals");
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
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-500 mb-4">
            Please log in again to access this page.
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
      <h1 className="text-3xl font-bold mb-6">Completed Deals</h1>

      {deals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🤝</div>
          <h2 className="text-xl font-semibold mb-2">No Completed Deals Yet</h2>
          <p className="text-gray-500">
            When you complete property inspections, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {deal.propertyId?.title || "Property Deal"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Client: {deal.clientId?.firstName} {deal.clientId?.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completed: {new Date(deal.scheduledDate).toLocaleDateString()}
                  </p>
                  {deal.feedback && (
                    <p className="text-sm text-green-600 mt-2">
                      Feedback: {deal.feedback}
                    </p>
                  )}
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
