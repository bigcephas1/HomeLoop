"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ defaultPath = "/dashboard", className = "" }) {
  const router = useRouter();

  const goBack = () => {
    const previousPath = sessionStorage.getItem("previousPath");
    if (previousPath && previousPath !== window.location.pathname) {
      router.back();
    } else {
      router.push(defaultPath);
    }
  };

  return (
    <button
      onClick={goBack}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Go Back
    </button>
  );
}
