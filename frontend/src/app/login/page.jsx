"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);
      
      if (res.data.success) {
        const userData = res.data.user;
        toast.success("Login successful!");
        login(userData);
        
        // Role-based redirect
        const roleRoutes = {
          admin: "/admin/dashboard",
          landlord: "/dashboard/landlord",
          service_provider: "/dashboard/service-provider",
          representative: "/dashboard/representative",
          client: "/dashboard/user",
        };
        
        const redirectPath = roleRoutes[userData.role] || "/dashboard/user";
        // Use window.location for hard redirect
        window.location.href = redirectPath;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-black text-black dark:text-white">
      <div className="hidden lg:flex items-center justify-center bg-cover bg-center relative bg-[url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85')]">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-lg px-10 text-white">
          <h1 className="text-6xl font-bold">Luxury Living Starts Here</h1>
          <p className="mt-6 text-gray-300">Find premium homes and trusted services.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-3xl p-8 border border-black/10 dark:border-white/10 bg-white dark:bg-black">
          <h2 className="text-4xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-8">Login to your account</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/admin/login")}
              className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
            >
              Admin Login →
            </button>
          </div>

          <p className="text-gray-500 text-sm mt-4 text-center">
            Don't have an account?
            <button
              onClick={() => router.push("/register")}
              className="text-black dark:text-white cursor-pointer ml-2 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
