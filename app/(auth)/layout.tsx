"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MojiLogo } from "@/components/auth/AuthCard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";

  // Detect verification page
  const isVerifyPage = pathname.includes("verify-email");

  const footer = (
    <footer className="flex flex-none justify-center gap-6 py-2 text-center text-[11px] text-gray-400">
      <span>&copy; {new Date().getFullYear()} Moji Inc.</span>
      <Link
        href="#"
        className="rounded-full font-medium transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15"
      >
        Terms of Use
      </Link>
      <Link
        href="#"
        className="rounded-full font-medium transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15"
      >
        Privacy Policy
      </Link>
    </footer>
  );

  if (isVerifyPage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4 sm:p-6">
        <div className="flex min-h-[460px] w-full max-w-[480px] flex-none flex-col justify-between rounded-3xl border border-gray-100 bg-white p-8 sm:p-11">
          <div className="mb-6 flex-none">
            <MojiLogo />
          </div>
          <main className="flex flex-grow flex-col justify-center">
            <div className="mx-auto w-full max-w-[360px]">{children}</div>
          </main>
        </div>
        {footer}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4 lg:p-8">
      <div className="flex min-h-[75vh] w-full max-w-[1180px] flex-none items-stretch overflow-hidden rounded-3xl border border-gray-100 bg-white lg:min-h-[80vh]">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2">
          <aside className="flex min-h-full flex-col justify-between px-7 py-9 sm:px-10 sm:py-11 xl:px-14">
            <MojiLogo />
            <main className="my-auto py-8">
              <div className="mx-auto w-full max-w-[392px]">{children}</div>
            </main>
          </aside>
          <section
            className="relative hidden bg-cover bg-center lg:block"
            style={{ backgroundImage: "url('/restaurant_art.png')" }}
          >
            <div className="absolute inset-0 bg-black/10" />
          </section>
        </div>
      </div>
      {footer}
    </div>
  );
}
