"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function DocumentUpload({ onUploadComplete, existingDocuments = [] }) {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState(existingDocuments);
  const [selectedType, setSelectedType] = useState("id_card");

  const documentTypes = [
    { value: "id_card", label: "Government ID Card" },
    { value: "passport", label: "Passport" },
    { value: "utility_bill", label: "Utility Bill (Proof of Address)" },
    { value: "business_license", label: "Business License" },
    { value: "other", label: "Other Document" },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, or PDF files are allowed");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("type", selectedType);

    setUploading(true);
    try {
      const response = await api.post("/uploads/document", formData);
      const newDoc = {
        type: selectedType,
        url: response.data.url,
        public_id: response.data.public_id,
        uploadedAt: new Date(),
      };
      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);
      onUploadComplete(updatedDocs);
      toast.success("Document uploaded successfully");
      e.target.value = "";
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index) => {
    const docToDelete = documents[index];
    try {
      await api.delete(`/uploads/${docToDelete.public_id}`);
      const updatedDocs = documents.filter((_, i) => i !== index);
      setDocuments(updatedDocs);
      onUploadComplete(updatedDocs);
      toast.success("Document deleted");
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Document Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Upload Document</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {uploading && (
        <div className="text-center text-blue-600">Uploading...</div>
      )}

      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Uploaded Documents:</h4>
          {documents.map((doc, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium">
                  {documentTypes.find(t => t.value === doc.type)?.label || doc.type}
                </p>
                <p className="text-sm text-gray-500">
                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View
                </a>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
