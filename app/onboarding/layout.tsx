"use client";

import { Check, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();

  // Determine active step
  const isStep1 = pathname.includes("step-1");
  const isStep2 = pathname.includes("step-2");

  const progressPercentage = isStep1 ? 50 : 100;

  const steps = [
    {
      id: 1,
      name: "Restaurant Profile",
      description: "Basic info and cuisine",
      active: isStep1,
      completed: isStep2,
      path: "/onboarding/step-1",
    },
    {
      id: 2,
      name: "Menu QR & PDF",
      description: "PDF template & menu QR",
      active: isStep2,
      completed: false,
      path: "/onboarding/step-2",
    },
  ];

  const handleSignOut = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 lg:p-8 gap-4">
      {/* Inner Container: Framed Card */}
      <div className="w-full max-w-[1200px] bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col lg:flex-row min-h-[80vh] lg:min-h-[85vh] flex-none">
        {/* Left Sidebar: Desktop Stepper */}
        <aside className="hidden lg:flex w-80 border-r border-gray-100 bg-gray-50/50 p-8 flex-col justify-between flex-none">
          <div className="space-y-12">
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

            {/* Stepper list */}
            <nav className="space-y-6">
              {steps.map((step) => {
                const isActive = step.active;
                const isCompleted = step.completed;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 transition-opacity duration-300 ${
                      isActive || isCompleted ? "opacity-100" : "opacity-50"
                    }`}
                  >
                    {/* Circle Indicator */}
                    <div className="relative flex items-center justify-center mt-0.5">
                      {isCompleted ? (
                        <div className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center text-white border border-gray-900">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      ) : isActive ? (
                        <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-gray-900 border-2 border-gray-900 ring-4 ring-gray-900/10">
                          <div className="h-2 w-2 rounded-full bg-gray-900"></div>
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-gray-300 border-2 border-gray-200">
                          <span className="text-xs font-semibold">
                            {step.id}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div>
                      <p
                        className={`text-sm font-bold ${isActive ? "text-gray-900" : "text-gray-600"}`}
                      >
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* User Card & Sign Out */}
          <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                JA
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Joseph Atada</p>
                <p className="text-[10px] text-gray-400">Owner Account</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col min-h-[80vh] lg:min-h-full">
          {/* Top Progress bar and Header */}
          <header className="h-14 border-b border-gray-100 flex items-center justify-between px-6 flex-none bg-white relative">
            {/* Horizontal Top Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-100">
              <div
                className="h-full bg-gray-900 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            <div className="flex items-center gap-4">
              {/* Mobile-only Step Badge */}
              <span className="lg:hidden px-2 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-600">
                STEP {isStep1 ? "1" : "2"} OF 2
              </span>
              <span className="hidden sm:inline text-xs text-gray-400 font-medium">
                Onboarding Checklist
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("onboarding_complete", "true");
                router.push("/dashboard");
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
            >
              Skip to dashboard
            </button>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto bg-white flex flex-col justify-between">
            <div className="max-w-[580px] w-full mx-auto px-6 py-10 lg:py-16">
              {children}
            </div>
          </main>
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
