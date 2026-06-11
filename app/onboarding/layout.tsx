"use client";

import { Check, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MojiLogo } from "@/components/auth/AuthCard";

const steps = [
  {
    id: 1,
    name: "Restaurant Profile",
    description: "Basic info and cuisine",
    path: "/onboarding/step-1",
  },
  {
    id: 2,
    name: "Menu QR & PDF",
    description: "PDF template & menu QR",
    path: "/onboarding/step-2",
  },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const activeStep = steps.find((step) => pathname.includes(`step-${step.id}`));
  const activeStepId = activeStep?.id ?? 1;
  const progressPercentage = Math.round((activeStepId / steps.length) * 100);

  const handleSignOut = () => {
    router.push("/login");
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-gray-50 p-4 lg:p-8">
      <div className="flex h-[calc(100vh-64px)] w-full max-w-[1200px] flex-none flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white lg:h-[min(860px,calc(100vh-88px))] lg:flex-row">
        <aside className="hidden w-80 flex-none flex-col justify-between border-r border-gray-100 bg-gray-50/70 p-8 lg:flex">
          <div className="space-y-12">
            <MojiLogo />

            <nav className="space-y-6" aria-label="Onboarding progress">
              {steps.map((step) => {
                const isActive = step.id === activeStepId;
                const isCompleted = step.id < activeStepId;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 transition-opacity duration-300 ${
                      isActive || isCompleted ? "opacity-100" : "opacity-50"
                    }`}
                  >
                    <div className="mt-0.5 flex items-center justify-center">
                      {isCompleted ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-900 bg-gray-900 text-white">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      ) : isActive ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-900 bg-white text-gray-900 ring-4 ring-gray-900/10">
                          <div className="h-2 w-2 rounded-full bg-gray-900" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-300">
                          <span className="text-xs font-semibold">
                            {step.id}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? "text-gray-900" : "text-gray-600"
                        }`}
                      >
                        {step.name}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
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
              className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col">
          <header className="relative flex h-14 flex-none items-center justify-between border-b border-gray-100 bg-white px-5 sm:px-6">
            <div className="absolute left-0 right-0 top-0 h-0.5 bg-gray-100">
              <div
                className="h-full bg-gray-900 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600 lg:hidden">
                STEP {activeStepId} OF {steps.length}
              </span>
              <span className="hidden text-xs font-medium text-gray-400 sm:inline">
                Onboarding checklist
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("onboarding_complete", "true");
                router.push("/dashboard");
              }}
              className="cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-95"
            >
              Skip to dashboard
            </button>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto bg-white">
            <div className="mx-auto flex min-h-full w-full max-w-[620px] flex-col px-5 pt-9 pb-0 sm:px-6 lg:pt-14">
              {children}
            </div>
          </main>
        </div>
      </div>

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
    </div>
  );
}
