// "use client";

// import Link from "next/link";

// import {
//   Facebook,
//   Instagram,
//   Twitter,
//   MessageCircle,
//   Mail,
// } from "lucide-react";

// export default function Footer() {
//   return (
//     <footer
//       className="
//         border-t
//         border-white/10
//         mt-20
//         bg-black
//       "
//     >
//       <div
//         className="
//           max-w-7xl
//           mx-auto
//           px-6
//           lg:px-10
//           py-16
//         "
//       >
//         {/* TOP */}

//         <div
//           className="
//             grid
//             md:grid-cols-4
//             gap-10
//           "
//         >
//           {/* BRAND */}

//           <div>
//             <h2 className="text-3xl font-bold">
//               HOMELOOP
//             </h2>

//             <p className="text-gray-400 mt-4 leading-7">
//               Premium real estate platform
//               connecting clients,
//               landlords, service providers,
//               and representatives.
//             </p>
//           </div>

//           {/* COMPANY */}

//           <div>
//             <h3 className="font-semibold text-lg mb-5">
//               Company
//             </h3>

//             <div className="space-y-3 text-gray-400">
//               <Link
//                 href="/about"
//                 className="block hover:text-white transition"
//               >
//                 About
//               </Link>

//               <Link
//                 href="/properties"
//                 className="block hover:text-white transition"
//               >
//                 Properties
//               </Link>

//               <Link
//                 href="/services"
//                 className="block hover:text-white transition"
//               >
//                 Services
//               </Link>

//               <Link
//                 href="/blogs"
//                 className="block hover:text-white transition"
//               >
//                 Blogs
//               </Link>
//             </div>
//           </div>

//           {/* LEGAL */}

//           <div>
//             <h3 className="font-semibold text-lg mb-5">
//               Legal
//             </h3>

//             <div className="space-y-3 text-gray-400">
//               <Link
//                 href="/terms"
//                 className="block hover:text-white transition"
//               >
//                 Terms & Conditions
//               </Link>

//               <Link
//                 href="/privacy-policy"
//                 className="block hover:text-white transition"
//               >
//                 Privacy Policy
//               </Link>

//               <Link
//                 href="/license"
//                 className="block hover:text-white transition"
//               >
//                 License
//               </Link>

//               <Link
//                 href="/trademark"
//                 className="block hover:text-white transition"
//               >
//                 Homeloop Trademark
//               </Link>
//             </div>
//           </div>

//           {/* SUPPORT */}

//           <div>
//             <h3 className="font-semibold text-lg mb-5">
//               Support
//             </h3>

//             <div className="space-y-4 text-gray-400">
//               <p>support@homeloop.com</p>

//               <p>+234 800 000 0000</p>

//               {/* SOCIALS */}

//               <div className="flex items-center gap-4 pt-3">
//                 <a
//                   href="#"
//                   className="
//                     w-10
//                     h-10
//                     rounded-full
//                     border
//                     border-white/10
//                     flex
//                     items-center
//                     justify-center
//                     hover:bg-white
//                     hover:text-black
//                     transition
//                   "
//                 >
//                   <Facebook size={18} />
//                 </a>

//                 <a
//                   href="#"
//                   className="
//                     w-10
//                     h-10
//                     rounded-full
//                     border
//                     border-white/10
//                     flex
//                     items-center
//                     justify-center
//                     hover:bg-white
//                     hover:text-black
//                     transition
//                   "
//                 >
//                   <Instagram size={18} />
//                 </a>

//                 <a
//                   href="#"
//                   className="
//                     w-10
//                     h-10
//                     rounded-full
//                     border
//                     border-white/10
//                     flex
//                     items-center
//                     justify-center
//                     hover:bg-white
//                     hover:text-black
//                     transition
//                   "
//                 >
//                   <Twitter size={18} />
//                 </a>

//                 <a
//                   href="#"
//                   className="
//                     w-10
//                     h-10
//                     rounded-full
//                     border
//                     border-white/10
//                     flex
//                     items-center
//                     justify-center
//                     hover:bg-white
//                     hover:text-black
//                     transition
//                   "
//                 >
//                   <MessageCircle size={18} />
//                 </a>

//                 <a
//                   href="mailto:support@homeloop.com"
//                   className="
//                     w-10
//                     h-10
//                     rounded-full
//                     border
//                     border-white/10
//                     flex
//                     items-center
//                     justify-center
//                     hover:bg-white
//                     hover:text-black
//                     transition
//                   "
//                 >
//                   <Mail size={18} />
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* BOTTOM */}

//         <div
//           className="
//             border-t
//             border-white/10
//             mt-12
//             pt-8
//             flex
//             flex-col
//             md:flex-row
//             items-center
//             justify-between
//             gap-4
//             text-gray-500
//             text-sm
//           "
//         >
//           <p>
//             © 2026 Homeloop. All rights
//             reserved.
//           </p>

//           <p>
//             Designed for premium real
//             estate experiences.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }





"use client";

import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* BRAND */}
          <div>
            <h2 className="text-3xl font-bold text-black dark:text-white">
              HOMELOOP
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4 leading-7">
              Premium real estate platform connecting clients, landlords,
              service providers, and representatives.
            </p>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="font-semibold text-lg mb-5 text-black dark:text-white">
              Company
            </h3>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              {["About", "Properties", "Services", "Blogs"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="block hover:text-black dark:hover:text-white transition"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* LEGAL */}
          <div>
            <h3 className="font-semibold text-lg mb-5 text-black dark:text-white">
              Legal
            </h3>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <Link href="#" className="block hover:text-black dark:hover:text-white transition">
                Terms & Conditions
              </Link>
              <Link href="#" className="block hover:text-black dark:hover:text-white transition">
                Privacy Policy
              </Link>
              <Link href="#" className="block hover:text-black dark:hover:text-white transition">
                License
              </Link>
            </div>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="font-semibold text-lg mb-5 text-black dark:text-white">
              Support
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>support@homeloop.com</p>
              <p>+234 800 000 0000</p>
              <div className="flex gap-4 pt-3">
                {[FaFacebook, FaInstagram, FaTwitter].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/10 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                  >
                    <Icon size={18} />
                  </a>
                ))}
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/10 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                >
                  <MessageCircle size={18} />
                </a>
                <a
                  href="mailto:support@homeloop.com"
                  className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/10 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10 mt-12 pt-8 text-gray-500 text-sm flex flex-col md:flex-row justify-between gap-4">
          <p>© 2026 Homeloop. All rights reserved.</p>
          <p>Designed for premium real estate experiences.</p>
        </div>
      </div>
    </footer>
  );
}