"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  
  // Only show navbar on home, login, and register pages
  const showNavbar = pathname === "/" || pathname === "/login" || pathname === "/register";
  
  if (!showNavbar) return null;
  
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/70">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
        
        <Link href="/" className="text-3xl font-bold tracking-widest">
          HOMELOOP
        </Link>

        <nav className="hidden md:flex gap-8 text-gray-500 dark:text-gray-400">
          <Link href="/" className={`hover:text-black dark:hover:text-white transition ${pathname === "/" ? "text-black dark:text-white" : ""}`}>
            Home
          </Link>
          <Link href="/properties" className="hover:text-black dark:hover:text-white transition">
            Properties
          </Link>
          <Link href="/services" className="hover:text-black dark:hover:text-white transition">
            Services
          </Link>
          <Link href="/blogs" className="hover:text-black dark:hover:text-white transition">
            Blogs
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className={`px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition ${pathname === "/login" ? "bg-black/5 dark:bg-white/10" : ""}`}
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className={`px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition ${pathname === "/register" ? "opacity-90" : ""}`}
          >
            Sign Up
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
