"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function RepresentativeSchedulePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inspections, setInspections] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "representative")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "representative") {
      fetchSchedule();
    }
  }, [user, selectedDate]);

  const fetchSchedule = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/representative-inspections/representative/inspections");
      let allInspections = Array.isArray(response.data) ? response.data : response.data.inspections || [];
      
      // Filter by selected date
      const filtered = allInspections.filter(inspection => {
        const inspectionDate = new Date(inspection.scheduledDate).toISOString().split("T")[0];
        return inspectionDate === selectedDate;
      });
      
      setInspections(filtered);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Failed to load schedule");
    } finally {
      setLoadingData(false);
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

  // Get next 7 days for quick selection
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const nextDays = getNextDays();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Schedule</h1>

      {/* Date Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Date</h2>
        <div className="flex flex-wrap gap-2">
          {nextDays.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedDate === date
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule for selected date */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            Schedule for {new Date(selectedDate).toLocaleDateString(undefined, { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </h2>
        </div>

        {inspections.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500">No inspections scheduled for this date</p>
            <p className="text-sm text-gray-400 mt-2">
              Bookings will appear here when clients schedule inspections
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {inspections.map((inspection) => (
              <div key={inspection._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {inspection.propertyId?.title || "Property Inspection"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Client: {inspection.clientId?.firstName} {inspection.clientId?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Time: {new Date(inspection.scheduledDate).toLocaleTimeString()}
                    </p>
                    {inspection.notes && (
                      <p className="text-sm text-gray-500 mt-2">
                        Notes: {inspection.notes}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(inspection.status)}`}>
                      {inspection.status}
                    </span>
                  </div>
                </div>

                {inspection.status === "confirmed" && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        window.location.href = `/dashboard/representative/inspections`;
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Manage Inspection →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{inspections.filter(i => i.status === "confirmed").length}</p>
          <p className="text-sm text-gray-500">Confirmed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{inspections.filter(i => i.status === "pending").length}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{inspections.filter(i => i.status === "completed").length}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
      </div>
    </div>
  );
}
