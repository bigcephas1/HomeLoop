"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function CreatePropertyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "house",
    purpose: "rent",
    price: "",
    bedrooms: "",
    bathrooms: "",
    parkingSpaces: "",
    size: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    amenities: [],
    latitude: "",
    longitude: "",
  });
  const [amenityInput, setAmenityInput] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "landlord")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()],
      });
      setAmenityInput("");
    }
  };

  const removeAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        parkingSpaces: Number(formData.parkingSpaces) || 0,
        size: Number(formData.size) || 0,
        location: {
          type: "Point",
          coordinates: [Number(formData.longitude) || 0, Number(formData.latitude) || 0],
        },
      };

      await api.post("/properties", payload);
      toast.success("Property created successfully");
      router.push("/dashboard/landlord/properties");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create property");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold mb-6">List New Property</h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Spacious 3-Bedroom Apartment"
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
                placeholder="Detailed description of the property..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                  Property Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white"
                  required
                >
                  <option value="house">House</option>
                  <option value="land">Land</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                  Purpose
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white"
                  required
                >
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                  <option value="lease">For Lease</option>
                  <option value="shortlet">Shortlet</option>
                </select>
              </div>
            </div>

            <Input
              label="Price (₦)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 350000"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
              />
              <Input
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
              />
              <Input
                label="Parking Spaces"
                name="parkingSpaces"
                type="number"
                value={formData.parkingSpaces}
                onChange={handleChange}
              />
              <Input
                label="Size (sqm)"
                name="size"
                type="number"
                value={formData.size}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white"
                >
                  <option value="Nigeria">Nigeria</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Kenya">Kenya</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g., 11.9964"
              />
              <Input
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g., 8.5217"
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Amenities
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white"
                  placeholder="e.g., WiFi, Parking, Security"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Property"}
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
