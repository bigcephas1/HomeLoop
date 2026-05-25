"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function RepresentativeClientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "representative")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "representative") {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/representative-inspections/representative/inspections");
      const inspections = Array.isArray(response.data) ? response.data : response.data.inspections || [];
      
      const uniqueClients = [];
      const clientMap = new Map();
      
      inspections.forEach(inspection => {
        if (inspection.clientId && !clientMap.has(inspection.clientId._id)) {
          clientMap.set(inspection.clientId._id, inspection.clientId);
          uniqueClients.push({
            ...inspection.clientId,
            inspectionCount: inspections.filter(i => i.clientId?._id === inspection.clientId._id).length,
            lastInspection: new Date(Math.max(...inspections.filter(i => i.clientId?._id === inspection.clientId._id).map(i => new Date(i.scheduledDate))))
          });
        }
      });
      
      setClients(uniqueClients);
      setIsVerified(true);
    } catch (error) {
      console.error("Error fetching clients:", error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        setIsVerified(false);
        setClients([]);
        toast.error("Please login again to view clients");
      } else {
        toast.error("Failed to load clients");
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
      <h1 className="text-3xl font-bold mb-6">My Clients</h1>

      {clients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-xl font-semibold mb-2">No Clients Yet</h2>
          <p className="text-gray-500">
            When clients book property inspections with you, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {client.firstName?.charAt(0)}{client.lastName?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {client.firstName} {client.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  📅 Inspections: {client.inspectionCount}
                </p>
                {client.lastInspection && (
                  <p className="text-gray-600 dark:text-gray-400">
                    🕐 Last: {new Date(client.lastInspection).toLocaleDateString()}
                  </p>
                )}
                {client.phoneNumber && (
                  <p className="text-gray-600 dark:text-gray-400">
                    📞 {client.phoneNumber}
                  </p>
                )}
              </div>
              <button
                onClick={() => toast.error("Messaging coming soon")}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Message Client
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
