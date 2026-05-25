"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";

function ServicesContent() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  useEffect(() => {
    fetchServices();
  }, [filters, pagination.page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: 12,
      });
      const response = await api.get(`/services?${queryParams}`);
      setServices(response.data.services || []);
      setPagination({
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.pages || 1,
      });
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    const role = user.role;
    const links = {
      admin: "/admin/dashboard",
      landlord: "/dashboard/landlord",
      service_provider: "/dashboard/service-provider",
      representative: "/dashboard/representative",
      client: "/dashboard/user",
    };
    return links[role] || "/dashboard/user";
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button - Only show if user is logged in */}
        {user && (
          <div className="mb-6">
            <Link
              href={getDashboardLink()}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              ← Back to Dashboard
            </Link>
          </div>
        )}

        <h1 className="text-4xl font-bold mb-8">Browse Services</h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={fetchServices}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={() => setFilters({ category: "", minPrice: "", maxPrice: "" })}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">Loading...</div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No services found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Link
                  key={service._id}
                  href={`/services/${service._id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                      {service.description}
                    </p>
                    <p className="text-blue-600 font-bold text-xl">
                      ₦{service.price?.toLocaleString()}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500 capitalize">
                        {service.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {service.duration} mins
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ServicesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
      <div className="text-center">Loading services...</div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesLoading />}>
      <ServicesContent />
    </Suspense>
  );
}
