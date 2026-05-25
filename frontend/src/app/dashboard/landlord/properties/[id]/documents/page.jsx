"use client";

import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import DocumentUpload from "@/components/DocumentUpload";

export default function PropertyDocumentsPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [ownershipDocs, setOwnershipDocs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "landlord")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data);
      setOwnershipDocs(response.data.ownershipDocuments || []);
    } catch (error) {
      toast.error("Failed to load property");
      router.push("/dashboard/landlord/properties");
    } finally {
      setLoadingData(false);
    }
  };

  const handleDocumentsUpdate = async (docs) => {
    try {
      await api.patch(`/properties/${id}`, {
        ownershipDocuments: docs,
        documentVerificationStatus: "pending",
      });
      setOwnershipDocs(docs);
      toast.success("Documents updated. Property will be reviewed.");
    } catch (error) {
      toast.error("Failed to update documents");
    }
  };

  const documentTypes = [
    { value: "deed", label: "Property Deed" },
    { value: "title", label: "Title Document" },
    { value: "survey_plan", label: "Survey Plan" },
    { value: "rental_agreement", label: "Rental Agreement" },
    { value: "other", label: "Other Document" },
  ];

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Property Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload ownership documents for: {property?.title}
          </p>

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold mb-2">Why upload documents?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uploading property ownership documents helps verify that you are the legitimate owner.
              This increases trust from potential tenants/buyers and speeds up the verification process.
            </p>
          </div>

          <DocumentUpload
            documentTypes={documentTypes}
            existingDocuments={ownershipDocs}
            onUploadComplete={handleDocumentsUpdate}
            uploadEndpoint="/uploads/property-document"
          />

          {property?.documentVerificationStatus === "verified" && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
              ✓ Your documents have been verified!
            </div>
          )}

          {property?.documentVerificationStatus === "mismatch" && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
              ⚠ Document mismatch detected. Please ensure your documents match your profile information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
