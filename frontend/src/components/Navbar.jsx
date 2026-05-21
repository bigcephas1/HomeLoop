'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '#';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'landlord') return '/dashboard/landlord';
    return '/dashboard/user';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="HomeLoop" className="h-8 w-auto" />
            <span className="font-bold text-xl text-blue-700">HomeLoop</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/about" className="text-gray-700 hover:text-blue-600">
              About
            </Link>
            <Link
              href="/properties"
              className="text-gray-700 hover:text-blue-600"
            >
              Properties
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
            {!user ? (
              <>
                <Link href="/login" className="text-blue-600 font-medium">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={getDashboardPath()}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              href="/about"
              className="block text-gray-700 hover:text-blue-600"
            >
              About
            </Link>
            <Link
              href="/properties"
              className="block text-gray-700 hover:text-blue-600"
            >
              Properties
            </Link>
            <Link
              href="/contact"
              className="block text-gray-700 hover:text-blue-600"
            >
              Contact
            </Link>
            {!user ? (
              <>
                <Link href="/login" className="block text-blue-600">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block bg-blue-600 text-white text-center px-4 py-2 rounded-full"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link href={getDashboardPath()} className="block text-gray-700">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="block text-red-600 w-full text-left"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
