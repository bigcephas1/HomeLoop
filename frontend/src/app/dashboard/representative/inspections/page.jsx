"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function RepresentativeInspectionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inspections, setInspections] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "representative")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "representative") {
      fetchInspections();
    }
  }, [user]);

  const fetchInspections = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/representative-inspections/representative/inspections");
      setInspections(Array.isArray(response.data) ? response.data : response.data.inspections || []);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      toast.error("Failed to load inspections");
    } finally {
      setLoadingData(false);
    }
  };

  const updateInspectionStatus = async (inspectionId, status) => {
    const feedback = status === "completed" ? prompt("Enter inspection feedback (optional):") : "";
    try {
      await api.patch(`/representative-inspections/${inspectionId}/status`, { 
        status,
        feedback: feedback || undefined
      });
      toast.success(`Inspection ${status}`);
      fetchInspections();
    } catch (error) {
      toast.error("Failed to update inspection");
    }
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Property Inspections</h1>

      {inspections.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">No Inspections Yet</h2>
          <p className="text-gray-500">
            When clients book property inspections, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inspections.map((inspection) => (
            <div key={inspection._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {inspection.propertyId?.title || "Property Inspection"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Client: {inspection.clientId?.firstName} {inspection.clientId?.lastName}
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
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => updateInspectionStatus(inspection._id, "confirmed")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Accept Inspection
                  </button>
                  <button
                    onClick={() => updateInspectionStatus(inspection._id, "cancelled")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Decline
                  </button>
                </div>
              )}

              {inspection.status === "confirmed" && (
                <div className="mt-4">
                  <button
                    onClick={() => updateInspectionStatus(inspection._id, "completed")}
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
