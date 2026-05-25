"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function UserInspectionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inspections, setInspections] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchInspections();
    }
  }, [user]);

  const fetchInspections = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/representative-inspections/my-inspections");
      let allInspections = Array.isArray(response.data) ? response.data : response.data.inspections || [];
      setInspections(allInspections);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      setInspections([]);
    } finally {
      setLoadingData(false);
    }
  };

  const cancelInspection = async (inspectionId) => {
    if (!confirm("Are you sure you want to cancel this inspection?")) return;
    try {
      await api.patch(`/representative-inspections/${inspectionId}/cancel`);
      toast.success("Inspection cancelled");
      fetchInspections();
    } catch (error) {
      toast.error("Failed to cancel inspection");
    }
  };

  const getFilteredInspections = () => {
    if (filter === "all") return inspections;
    return inspections.filter(i => i.status === filter);
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

  const filteredInspections = getFilteredInspections();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Property Inspections</h1>

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

      {filteredInspections.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">No Inspections Found</h2>
          <p className="text-gray-500">
            {filter === "all" 
              ? "You haven't booked any property inspections yet."
              : `No ${filter} inspections found.`}
          </p>
          <Link href="/properties" className="inline-block mt-4 text-blue-600 hover:underline">
            Browse Properties →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInspections.map((inspection) => (
            <div key={inspection._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {inspection.propertyId?.title || "Property Inspection"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Representative: {inspection.representativeId?.firstName} {inspection.representativeId?.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Date: {new Date(inspection.scheduledDate).toLocaleString()}
                  </p>
                  {inspection.notes && (
                    <p className="text-sm text-gray-500 mt-2">
                      Notes: {inspection.notes}
                    </p>
                  )}
                  {inspection.feedback && (
                    <p className="text-sm text-green-600 mt-2">
                      Feedback: {inspection.feedback}
                    </p>
                  )}
                </div>
                <div>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(inspection.status)}`}>
                    {inspection.status}
                  </span>
                </div>
              </div>

              {inspection.status === "pending" && (
                <div className="mt-4">
                  <button
                    onClick={() => cancelInspection(inspection._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Cancel Inspection
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
