import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="px-8 lg:px-20 pt-32 pb-20">
        <h1 className="text-6xl lg:text-8xl font-bold max-w-5xl leading-tight">
          Discover Luxury Living With Homeloop
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-8 text-xl max-w-2xl">
          Premium properties, trusted landlords, verified service providers
          and smart real estate experiences.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-semibold hover:opacity-90 transition"
          >
            Get Started
          </Link>
          <Link
            href="/properties"
            className="px-6 py-3 border border-black dark:border-white rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Browse Properties
          </Link>
        </div>
      </section>
    </main>
  );
}
