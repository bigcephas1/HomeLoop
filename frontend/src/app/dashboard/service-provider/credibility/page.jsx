"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import CredibilityScore from "@/components/CredibilityScore";
import DocumentUpload from "@/components/DocumentUpload";

export default function ServiceProviderCredibilityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "service_provider") {
        const roleRedirects = {
          landlord: "/dashboard/landlord",
          client: "/dashboard/user",
          representative: "/dashboard/representative",
          admin: "/admin/dashboard",
        };
        const redirectPath = roleRedirects[user.role] || "/login";
        router.push(redirectPath);
        toast.error(`This page is for Service Providers only. You are logged in as ${user.role}.`);
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "service_provider") {
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

  const createProfile = async () => {
    try {
      await api.post("/provider-profiles", {
        providerTypes: ["service_provider"],
        bio: "Professional service provider",
        yearsOfExperience: 1,
        skills: ["cleaning", "repairs", "maintenance"],
        phoneNumber: "+2348000000000"
      });
      toast.success("Service provider profile created successfully");
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create profile");
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
        <h1 className="text-3xl font-bold mb-6">Service Provider Verification</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🛠️</div>
          <h2 className="text-xl font-semibold mb-2">Create Your Service Provider Profile</h2>
          <p className="text-gray-500 mb-6">
            Create your service provider profile to start offering services and get verified.
          </p>
          <button
            onClick={createProfile}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Service Provider Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Service Provider Credibility</h1>

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
            Your documents are being reviewed by admin. This usually takes 24-48 hours.
          </p>
        )}
      </div>

      {/* Document Upload - Only show if not verified yet */}
      {profile?.verificationStatus !== "approved" && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Verification Documents</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload government ID, business license, or other verification documents to increase your credibility score.
            {(!profile?.verificationDocuments || profile?.verificationDocuments?.length === 0) && (
              <span className="block mt-2 text-yellow-600">
                ⚠ No documents uploaded yet. Your credibility score will be low without verification.
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
          ✓ Your account is verified! Clients can trust your services, and your credibility score will increase.
        </div>
      )}

      {/* Tips to Improve Credibility */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-semibold mb-2">How to improve your credibility:</h4>
        <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
          <li>✓ Upload government-issued ID or business license</li>
          <li>✓ Complete more jobs successfully</li>
          <li>✓ Maintain high ratings from clients</li>
          <li>✓ Respond quickly to client inquiries</li>
          <li>✓ Add professional certifications or training certificates</li>
        </ul>
      </div>
    </div>
  );
}
