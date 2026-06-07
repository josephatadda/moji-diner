"use client";

import { MailCheck, RefreshCw } from "lucide-react";
import { useState } from "react";
import { AuthCard, AuthLink, AuthNotice } from "@/components/auth/AuthCard";
import { DashboardButton } from "@/components/dashboard/ui";

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
    setResent(true);
  };

  return (
    <AuthCard
      eyebrow="Verify account"
      title="Check your email"
      description="Open the verification link we sent to activate your Moji workspace."
      footer={
        <p className="text-center text-sm text-gray-500">
          Already verified? <AuthLink href="/login">Sign in</AuthLink>
        </p>
      }
    >
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-green-100 bg-green-50 text-green-600">
          <MailCheck size={28} />
        </div>
        <AuthNotice
          tone={resent ? "success" : "info"}
          title={resent ? "Email resent" : "Verification required"}
        >
          {resent
            ? "A new mocked verification email has been sent."
            : "In production this page waits for the owner to confirm their email before continuing to onboarding."}
        </AuthNotice>
        <DashboardButton
          type="button"
          fullWidth
          variant="ghost"
          onClick={handleResend}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Sending..." : "Resend verification email"}
        </DashboardButton>
      </div>
    </AuthCard>
  );
}
