// import Image from 'next/image';

// export default function Home() {
//   return (
//     <div>
//       Welcome to HomeLoop, your secure and transparent housing platform designed
//       to reduce excessive agent fees, prevent scams, improve trust, and simplify
//       property discovery for house seekers.
//     </div>
//   );
// }

'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion'; // optional, for animations
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section with gradient overlay and split images */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        {/* Background images with overlay */}
        <div className="absolute inset-0 flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
            <Image
              src="/images/hero-gate.jpg"
              alt="Secure gate"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
            <Image
              src="/images/hero-building.jpg"
              alt="Luxury building"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold drop-shadow-lg"
          >
            HomeLoop
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl mt-4 mb-8 font-medium"
          >
            No Agent Fees. No Scams. Just Your Dream Home.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link
              href="/properties"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 inline-block"
            >
              Explore Properties
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
            />
          </svg>
        </div>
      </section>

      {/* Why Choose HomeLoop */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-6"
          >
            Why Choose HomeLoop?
          </motion.h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-lg">
            We've eliminated the traditional headaches of house hunting.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Zero Agent Fees',
                desc: 'No commissions, no hidden charges. Save thousands.',
                icon: '💰',
              },
              {
                title: 'Verified Owners & Legal Docs',
                desc: 'Every property and owner is vetted.',
                icon: '🔒',
              },
              {
                title: 'Premium Properties Anywhere',
                desc: 'From city apartments to quiet estates.',
                icon: '🏡',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Our Users Say - with card styling */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-12"
          >
            What Our Users Say
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl text-blue-500 mb-4">“</div>
              <p className="text-gray-700 text-lg italic">
                Found my apartment in 2 days – no agent fee! The verification
                system gave me peace of mind.
              </p>
              <div className="mt-4 font-semibold text-blue-600">– Sarah O.</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl text-blue-500 mb-4">“</div>
              <p className="text-gray-700 text-lg italic">
                Landlord was verified and documents legit. I've never had such a
                smooth rental process.
              </p>
              <div className="mt-4 font-semibold text-blue-600">
                – Michael K.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-blue-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to find your home?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Join thousands of happy homeowners and tenants.
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-700 px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Sign Up for Free
          </Link>
        </div>
      </section>
    </div>
  );
}