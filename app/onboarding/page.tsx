"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding/step-1");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
}
