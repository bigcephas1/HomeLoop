"use client";

import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function EditServicePage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loadingService, setLoadingService] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "cleaning",
    price: "",
    duration: "",
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "service_provider")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${id}`);
      const service = response.data;
      setFormData({
        title: service.title || "",
        description: service.description || "",
        category: service.category || "cleaning",
        price: service.price || "",
        duration: service.duration || "",
      });
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error("Failed to load service");
      router.push("/dashboard/service-provider/services");
    } finally {
      setLoadingService(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.patch(`/services/${id}`, {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
      });
      toast.success("Service updated successfully");
      router.push("/dashboard/service-provider/services");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update service");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    "cleaning",
    "plumbing",
    "electrical",
    "painting",
    "moving",
    "security",
    "landscaping",
    "other",
  ];

  if (loading || loadingService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6">Edit Service</h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Service Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Description
              </label>
              <textarea
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Price (₦)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
              />

              <Input
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-4 rounded-2xl border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
