"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import CredibilityScore from "@/components/CredibilityScore";
import DocumentUpload from "@/components/DocumentUpload";

export default function LandlordCredibilityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "landlord") {
        const roleRedirects = {
          service_provider: "/dashboard/service-provider",
          client: "/dashboard/user",
          representative: "/dashboard/representative",
          admin: "/admin/dashboard",
        };
        const redirectPath = roleRedirects[user.role] || "/login";
        router.push(redirectPath);
        toast.error(`This page is for Landlords only. You are logged in as ${user.role}.`);
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "landlord") {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/provider-profiles/me");
      setProfile(response.data);
      setHasProfile(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setHasProfile(false);
        setProfile(null);
      } else {
        toast.error("Failed to load profile data");
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleDocumentsUpdate = async (docs) => {
    try {
      await api.patch("/provider-profiles/me", {
        verificationDocuments: docs,
      });
      toast.success("Documents uploaded. Verification in progress.");
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update documents");
    }
  };

  const requestVerification = async () => {
    try {
      await api.patch("/provider-profiles/submit-verification");
      toast.success("Verification requested. Admin will review your documents.");
      fetchProfile();
    } catch (error) {
      toast.error("Failed to request verification");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Landlord Verification</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-xl font-semibold mb-2">Complete Your Landlord Profile First</h2>
          <p className="text-gray-500 mb-6">
            Please complete your landlord profile setup before uploading verification documents.
          </p>
          <button
            onClick={() => router.push("/dashboard/landlord")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Landlord Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Landlord Verification</h1>

      {/* Credibility Score */}
      <div className="mb-8">
        <CredibilityScore score={profile?.credibilityScore || 0} showDetails={true} />
      </div>

      {/* Verification Status */}
      <div className="mb-8 p-4 rounded-lg border">
        <h3 className="font-semibold mb-2">Verification Status</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 text-sm rounded-full ${
            profile?.verificationStatus === "approved" 
              ? "bg-green-100 text-green-800" 
              : profile?.verificationStatus === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {profile?.verificationStatus?.toUpperCase() || "NOT SUBMITTED"}
          </span>
        </div>
        {profile?.rejectionReason && (
          <p className="text-sm text-red-600 mt-2">
            Rejection reason: {profile.rejectionReason}
          </p>
        )}
        {profile?.verificationStatus === "pending" && (
          <p className="text-sm text-yellow-600 mt-2">
            Your documents are being reviewed by admin. You'll be notified once approved.
          </p>
        )}
      </div>

      {/* Document Upload - Only show if not verified yet */}
      {profile?.verificationStatus !== "approved" && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Verification Documents</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload property ownership documents, government ID, or other verification documents to get verified.
            {(!profile?.verificationDocuments || profile?.verificationDocuments?.length === 0) && (
              <span className="block mt-2 text-yellow-600">
                ⚠ No documents uploaded yet. Verification is required to list properties.
              </span>
            )}
          </p>
          <DocumentUpload
            existingDocuments={profile?.verificationDocuments || []}
            onUploadComplete={handleDocumentsUpdate}
          />
        </div>
      )}

      {/* Submit for Verification */}
      {profile?.verificationDocuments?.length > 0 && 
       profile?.verificationStatus !== "approved" && 
       profile?.verificationStatus !== "pending" && (
        <button
          onClick={requestVerification}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Submit for Verification
        </button>
      )}

      {profile?.verificationStatus === "approved" && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
          ✓ Your landlord account is verified! You can now list properties with trust from tenants.
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-semibold mb-2">Why get verified?</h4>
        <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
          <li>✓ Builds trust with potential tenants</li>
          <li>✓ Properties appear higher in search results</li>
          <li>✓ Faster approval for new property listings</li>
          <li>✓ Access to landlord-only features</li>
        </ul>
      </div>
    </div>
  );
}
