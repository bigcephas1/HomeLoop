"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const role = user.role;
      const roleRoutes = {
        admin: "/admin/dashboard",
        landlord: "/dashboard/landlord",
        service_provider: "/dashboard/service-provider",
        representative: "/dashboard/representative",
        client: "/dashboard/user",
      };
      router.push(roleRoutes[role] || "/dashboard/user");
    }
  }, [user, loading, router]);

  const [formData, setFormData] = useState({
    role: "client",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim()) {
      return toast.error("First name is required");
    }
    if (!formData.lastName.trim()) {
      return toast.error("Last name is required");
    }
    if (!formData.username.trim()) {
      return toast.error("Username is required");
    }
    if (!formData.email.trim()) {
      return toast.error("Email is required");
    }
    if (!formData.password) {
      return toast.error("Password is required");
    }
    if (!formData.confirmPassword) {
      return toast.error("Please confirm your password");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (!formData.address.trim()) {
      return toast.error("Address is required");
    }
    if (!formData.city.trim()) {
      return toast.error("City is required");
    }
    if (!formData.state.trim()) {
      return toast.error("State is required");
    }
    if (!formData.country) {
      return toast.error("Country is required");
    }

    try {
      setSubmitting(true);

      const payload = {
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
      };

      console.log("Sending payload:", payload);

      const response = await api.post("/auth/register", payload);
      console.log("Registration response:", response.data);

      toast.success("Registration successful! Please check your email to verify your account.");
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Registration failed. Please check all fields.";
      toast.error(errorMessage);
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
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-2xl rounded-3xl p-10 border border-black/10 dark:border-white/10 bg-white dark:bg-black">
        <h1 className="text-5xl font-bold mb-2">Create Account</h1>
        <p className="text-gray-400 mb-10">Join Homeloop today</p>
        
        <form onSubmit={handleRegister} className="grid md:grid-cols-2 gap-5">
          {/* ROLE */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
              Select Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white"
              required
            >
              <option value="client">Client</option>
              <option value="landlord">Landlord</option>
              <option value="service_provider">Service Provider</option>
              <option value="representative">Representative</option>
            </select>
          </div>

          <Input
            label="First Name *"
            name="firstName"
            placeholder="Peter"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <Input
            label="Last Name *"
            name="lastName"
            placeholder="Ukpabi"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <Input
            label="Username *"
            name="username"
            placeholder="peter"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <Input
            label="Email *"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password *"
            type="password"
            name="password"
            placeholder="******** (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Confirm Password *"
            type="password"
            name="confirmPassword"
            placeholder="********"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Input
            label="Address *"
            name="address"
            placeholder="Your street address"
            value={formData.address}
            onChange={handleChange}
            className="md:col-span-2"
            required
          />

          <Input
            label="City *"
            name="city"
            placeholder="Kumbotso"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <Input
            label="State *"
            name="state"
            placeholder="Kano"
            value={formData.state}
            onChange={handleChange}
            required
          />

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white"
              required
            >
              <option value="">Select Country</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
              <option value="Egypt">Egypt</option>
            </select>
          </div>

          <Input
            label="Postal Code"
            name="postalCode"
            placeholder="700001"
            value={formData.postalCode}
            onChange={handleChange}
          />

          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </form>

        <p className="text-gray-500 text-sm mt-6 text-center">
          Already have an account?
          <span
            onClick={() => router.push("/login")}
            className="text-black dark:text-white cursor-pointer ml-2 hover:underline"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
