// import { Geist, Geist_Mono } from 'next/font/google';
// import './globals.css';
// import { AuthProvider } from '@/context/AuthContext';
// import PageLayout from '@/components/PageLayout';
// import { Toaster } from 'react-hot-toast';

// const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
// const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

// export const metadata = {
//   title: 'HomeLoop',
//   description: 'HomeLoop is a secure, transparent, and safety-focused housing platform designed to reduce excessive agent fees, prevent scams, improve trust, and simplify property discovery for house seekers.',
//   keywords: ['home', 'loop', 'home loop', 'home automation', 'home security'],
//   author: 'HomeLoop Team',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
//       <body className="flex flex-col min-h-screen">
//         <AuthProvider>

//           <PageLayout>{children}</PageLayout>
//           <Toaster position="top-right" />
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

// import "./globals.css";
// import { Inter } from "next/font/google";
// import { Toaster } from "react-hot-toast";
// import { AuthProvider } from "@/context/AuthContext";
// import { ThemeProvider } from "next-themes";
// import Footer from "@/components/Footer";
// import Navbar from "@/components/Navbar";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "HomeLoop",
//   description: "Luxury Real Estate Platform",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={inter.className} suppressHydrationWarning>
//         <ThemeProvider 
//           attribute="class"
//           defaultTheme="system"
//           enableSystem={true}
//           disableTransitionOnChange={false}
//           enableColorScheme={true}
//         >
//           <AuthProvider>
//             <div className="flex flex-col min-h-screen">
//               <Navbar />
//               <main className="flex-grow">
//                 {children}
//               </main>
//               <Footer />
//             </div>
//             <Toaster position="top-right" />
//           </AuthProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }




import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HomeLoop",
  description: "Luxury Real Estate Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
