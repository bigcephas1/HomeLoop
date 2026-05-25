// 'use client';
// import { useAuth } from '@/context/AuthContext';
// import { useEffect, useState } from 'react';
// import api from '@/lib/api';

// export default function AdminDashboard() {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalProperties: 0,
//     pendingApprovals: 0,
//     totalBookings: 0,
//   });

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const [usersRes, propertiesRes, bookingsRes] = await Promise.all([
//           api.get('/users?limit=1'),
//           api.get('/properties/admin/all?limit=1'),
//           api.get('/bookings/user'), // adjust if admin endpoint exists
//         ]);
//         setStats({
//           totalUsers: usersRes.data.total || 0,
//           totalProperties: propertiesRes.data.total || 0,
//           pendingApprovals: propertiesRes.data.properties?.filter(p => p.moderationStatus === 'pending').length || 0,
//           totalBookings: bookingsRes.data.length || 0,
//         });
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchStats();
//   }, []);

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
//           <div className="text-gray-600">Total Users</div>
//         </div>
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="text-3xl font-bold text-green-600">{stats.totalProperties}</div>
//           <div className="text-gray-600">Total Properties</div>
//         </div>
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
//           <div className="text-gray-600">Pending Approvals</div>
//         </div>
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="text-3xl font-bold text-purple-600">{stats.totalBookings}</div>
//           <div className="text-gray-600">Total Bookings</div>
//         </div>
//       </div>
//       <div className="mt-8 bg-white rounded-lg shadow p-6">
//         <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
//         <p className="text-gray-500">Coming soon – list of recent user actions.</p>
//       </div>
//     </div>
//   );
// }



"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Admin Dashboard - User:", user);
    console.log("Admin Dashboard - Loading:", loading);
    
    if (!loading) {
      if (!user) {
        console.log("No user found, redirecting to login");
        router.push("/login");
      } else if (user.role !== "admin") {
        console.log("User is not admin, role:", user.role);
        // Redirect non-admin users to their respective dashboards
        const roleRoutes = {
          landlord: "/dashboard/landlord",
          service_provider: "/dashboard/service-provider",
          representative: "/dashboard/representative",
          user: "/dashboard/user",
        };
        const redirectPath = roleRoutes[user.role] || "/dashboard/user";
        console.log("Redirecting to:", redirectPath);
        router.push(redirectPath);
      } else {
        console.log("Admin user verified, showing dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome, {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Role: {user.role} | Email: {user.email}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-2">Properties</h3>
            <p className="text-3xl font-bold text-green-600">567</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-2">Active Listings</h3>
            <p className="text-3xl font-bold text-purple-600">89</p>
          </div>
        </div>
      </div>
    </div>
  );
}