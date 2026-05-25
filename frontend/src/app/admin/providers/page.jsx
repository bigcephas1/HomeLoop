"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminProviders() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchProviders();
    }
  }, [user, filter]);

  const fetchProviders = async () => {
    try {
      setLoadingData(true);
      let url = "/admin/providers";
      if (filter !== "all") {
        url += `?verificationStatus=${filter}`;
      }
      const response = await api.get(url);
      setProviders(response.data.profiles || []);
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast.error("Failed to load providers");
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = async (profileId) => {
    try {
      await api.patch(`/admin/providers/approve/${profileId}`);
      toast.success("Provider approved successfully");
      setShowDocsModal(false);
      fetchProviders();
    } catch (error) {
      toast.error("Failed to approve provider");
    }
  };

  const handleReject = async (profileId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await api.patch(`/admin/providers/reject/${profileId}`, { reason });
        toast.success("Provider rejected");
        setShowDocsModal(false);
        fetchProviders();
      } catch (error) {
        toast.error("Failed to reject provider");
      }
    }
  };

  const handleViewDocuments = (provider) => {
    if (provider.verificationDocuments && provider.verificationDocuments.length > 0) {
      setSelectedProvider(provider);
      setShowDocsModal(true);
    } else {
      toast.error("No documents uploaded yet");
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
          <h1 className="text-3xl font-bold">Provider Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
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
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {providers.map((provider) => (
                  <tr key={provider._id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{provider.userId?.firstName} {provider.userId?.lastName}</p>
                        <p className="text-sm text-gray-500">{provider.userId?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{provider.providerTypes?.join(", ")}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        provider.verificationStatus === "approved" ? "bg-green-100 text-green-800" :
                        provider.verificationStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                        provider.verificationStatus === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {provider.verificationStatus || "not_submitted"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDocuments(provider)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {provider.verificationDocuments?.length || 0} Document(s)
                      </button>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      {provider.verificationStatus === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(provider._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(provider._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {provider.verificationStatus === "approved" && (
                        <span className="text-green-600 text-sm">✓ Verified</span>
                      )}
                      {provider.verificationStatus === "rejected" && (
                        <span className="text-red-600 text-sm">✗ Rejected</span>
                      )}
                      {provider.verificationStatus === "not_submitted" && (
                        <span className="text-gray-500 text-sm">No docs</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showDocsModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Verification Documents</h2>
              <button 
                onClick={() => setShowDocsModal(false)} 
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {selectedProvider.verificationDocuments && selectedProvider.verificationDocuments.length > 0 ? (
                selectedProvider.verificationDocuments.map((doc, index) => (
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
            {selectedProvider.verificationStatus === "pending" && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleApprove(selectedProvider._id)}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Approve Provider
                </button>
                <button
                  onClick={() => handleReject(selectedProvider._id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Reject Provider
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
