"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminProperties() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchProperties();
    }
  }, [user, filter]);

  const fetchProperties = async () => {
    try {
      setLoadingData(true);
      // Use the correct endpoint - get all properties from /properties endpoint
      const response = await api.get("/properties?limit=100");
      let allProperties = response.data.properties || [];
      
      // Filter based on selection
      if (filter === "pending") {
        allProperties = allProperties.filter(p => p.moderationStatus === "pending");
      } else if (filter === "approved") {
        allProperties = allProperties.filter(p => p.moderationStatus === "approved");
      } else if (filter === "rejected") {
        allProperties = allProperties.filter(p => p.moderationStatus === "rejected");
      } else if (filter === "suspended") {
        allProperties = allProperties.filter(p => p.moderationStatus === "suspended");
      }
      
      setProperties(allProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = async (propertyId) => {
    try {
      await api.patch(`/admin/properties/approve/${propertyId}`);
      toast.success("Property approved successfully");
      setShowDocsModal(false);
      fetchProperties();
    } catch (error) {
      toast.error("Failed to approve property");
    }
  };

  const handleReject = async (propertyId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await api.patch(`/admin/properties/reject/${propertyId}`, { reason });
        toast.success("Property rejected");
        setShowDocsModal(false);
        fetchProperties();
      } catch (error) {
        toast.error("Failed to reject property");
      }
    }
  };

  const handleSuspend = async (propertyId) => {
    const reason = prompt("Enter suspension reason:");
    if (reason) {
      try {
        await api.patch(`/admin/properties/suspend/${propertyId}`, { reason });
        toast.success("Property suspended");
        fetchProperties();
      } catch (error) {
        toast.error("Failed to suspend property");
      }
    }
  };

  const handleViewDocuments = (property) => {
    if (property.ownershipDocuments && property.ownershipDocuments.length > 0) {
      setSelectedProperty(property);
      setShowDocsModal(true);
    } else {
      toast.error("No ownership documents uploaded");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Property Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-gray-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg ${filter === "pending" ? "bg-yellow-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-lg ${filter === "approved" ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-lg ${filter === "rejected" ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter("suspended")}
              className={`px-4 py-2 rounded-lg ${filter === "suspended" ? "bg-orange-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              Suspended
            </button>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No properties found</p>
            <p className="text-sm text-gray-400 mt-2">Properties will appear here once landlords create them.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Landlord</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Documents</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {properties.map((property) => (
                    <tr key={property._id}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        {property.landlord?.firstName} {property.landlord?.lastName}
                      </td>
                      <td className="px-6 py-4">₦{property.price?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.moderationStatus === "approved" ? "bg-green-100 text-green-800" :
                          property.moderationStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                          property.moderationStatus === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {property.moderationStatus || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDocuments(property)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {property.ownershipDocuments?.length || 0} Document(s)
                        </button>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        {property.moderationStatus === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(property._id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(property._id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(property.moderationStatus === "approved" || property.moderationStatus === "pending") && (
                          <button
                            onClick={() => handleSuspend(property._id)}
                            className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {showDocsModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Property Ownership Documents</h2>
              <button 
                onClick={() => setShowDocsModal(false)} 
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {selectedProperty.ownershipDocuments && selectedProperty.ownershipDocuments.length > 0 ? (
                selectedProperty.ownershipDocuments.map((doc, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <p className="font-medium mb-2">Document Type: {doc.type || 'Document'}</p>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document →
                    </a>
                    <p className="text-xs text-gray-500 mt-2">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No documents found</p>
              )}
            </div>
            {selectedProperty.moderationStatus === "pending" && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleApprove(selectedProperty._id)}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Approve Property
                </button>
                <button
                  onClick={() => handleReject(selectedProperty._id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Reject Property
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
