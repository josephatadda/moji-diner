"use client";

import { RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthCard, AuthNotice } from "@/components/auth/AuthCard";
import {
  DashboardButton,
  DashboardField,
  DashboardInput,
} from "@/components/dashboard/ui";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <span className="text-xs text-gray-400">Loading...</span>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "owner@restaurant.com";

  const [code, setCode] = useState("");
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (code.length < 4) {
      setError("Please enter a valid verification code.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);

    // Route based on actual account state (stored in sessionStorage onboarding_complete)
    const isCompleted =
      sessionStorage.getItem("onboarding_complete") === "true";
    if (isCompleted) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  };

  const handleResend = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
    setResent(true);
    setCode("");
  };

  return (
    <AuthCard
      title="Verify your account"
      description={`Enter the 6-digit code sent to ${email} to activate your restaurant workspace.`}
    >
      <form onSubmit={handleVerify} className="space-y-6">
        {error ? (
          <AuthNotice tone="error" title="Invalid code">
            {error}
          </AuthNotice>
        ) : resent ? (
          <AuthNotice tone="success" title="Code resent">
            A new mocked 6-digit code has been sent. Try entering any 6-digit
            number.
          </AuthNotice>
        ) : (
          <AuthNotice title="Mock test info">
            Enter any 6-digit code (e.g. 123456) to proceed. Routes to
            onboarding or dashboard depending on completed state.
          </AuthNotice>
        )}

        <DashboardField id="code" label="Verification code">
          <DashboardInput
            id="code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            className="text-center font-mono text-xl tracking-[0.25em] h-12 rounded-xl"
          />
        </DashboardField>

        <div className="flex gap-3">
          <DashboardButton
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => router.push("/signup")}
          >
            Back
          </DashboardButton>
          <DashboardButton type="submit" fullWidth disabled={loading}>
            {loading ? "Checking..." : "Continue"}
          </DashboardButton>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-xs text-gray-400 hover:text-gray-950 transition-colors inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>Resend verification code</span>
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
