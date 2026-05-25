"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [previousPath, setPreviousPath] = useState("/");

  useEffect(() => {
    // Get the previous path from session storage or use default
    const prevPath = sessionStorage.getItem("previousPath") || "/";
    setPreviousPath(prevPath);
  }, []);

  const goBack = () => {
    router.back();
  };

  const getDashboardLink = () => {
    // Check if user was on a dashboard page
    if (previousPath.includes("/dashboard") || previousPath.includes("/admin")) {
      return previousPath;
    }
    return "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Animated 404 Graphic */}
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-gray-300 dark:text-gray-700">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🔍</div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={goBack}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>

          <Link
            href={getDashboardLink()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home Page
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Need help? Try these common links:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/properties" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Browse Properties
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link href="/services" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Browse Services
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Login
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
