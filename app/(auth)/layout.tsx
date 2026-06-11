"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";

  // Detect verification page
  const isVerifyPage = pathname.includes("verify-email");

  // 1. Uber-style centered framed card for Verification page
  if (isVerifyPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 gap-4">
        <div className="w-full max-w-[480px] bg-white border border-gray-100 rounded-3xl flex flex-col justify-between p-8 sm:p-12 min-h-[460px] flex-none">
          {/* Top Logo */}
          <div className="flex items-center gap-2 mb-6 flex-none">
            <div className="relative flex items-center justify-center w-6 h-6">
              <div className="absolute top-0 left-2 w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <div className="absolute bottom-0 left-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
            </div>
            <p className="text-sm font-black tracking-tight text-gray-900">
              moji
            </p>
          </div>

          {/* Verification Code Form */}
          <main className="flex-grow flex flex-col justify-center">
            {children}
          </main>
        </div>

        {/* Footer outside the card */}
        <footer className="text-center text-[11px] text-gray-400 flex justify-center gap-6 py-2 flex-none">
          <span>&copy; {new Date().getFullYear()} Moji Inc.</span>
          <Link href="#" className="hover:text-gray-600 transition-colors">
            Terms of Use
          </Link>
          <Link href="#" className="hover:text-gray-600 transition-colors">
            Privacy Policy
          </Link>
        </footer>
      </div>
    );
  }

  // 2. Intercom-style split layout floating inside a framed card
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 lg:p-8 gap-4">
      <div className="w-full max-w-[1200px] bg-white border border-gray-100 rounded-3xl overflow-hidden flex items-stretch min-h-[75vh] lg:min-h-[80vh] flex-none">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side: Form Panel */}
          <aside className="flex flex-col justify-between py-12 px-8 sm:px-12 xl:px-16 min-h-full">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-6 h-6">
                <div className="absolute top-0 left-2 w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                <div className="absolute bottom-0 left-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
              </div>
              <p className="text-sm font-black tracking-tight text-gray-900">
                moji
              </p>
            </div>

            {/* Form */}
            <main className="my-auto py-8">
              <div className="max-w-[380px] mx-auto w-full">{children}</div>
            </main>
          </aside>

          {/* Right Side: Image Showcase Panel */}
          <section
            className="hidden lg:block relative bg-cover bg-center"
            style={{ backgroundImage: "url('/restaurant_art.png')" }}
          >
            {/* Subtle overlay to keep contrast */}
            <div className="absolute inset-0 bg-black/10"></div>
          </section>
        </div>
      </div>

      {/* Footer outside the card */}
      <footer className="text-center text-[11px] text-gray-400 flex justify-center gap-6 py-2 flex-none">
        <span>&copy; {new Date().getFullYear()} Moji Inc.</span>
        <Link href="#" className="hover:text-gray-600 transition-colors">
          Terms of Use
        </Link>
        <Link href="#" className="hover:text-gray-600 transition-colors">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
