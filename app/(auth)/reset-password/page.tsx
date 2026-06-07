"use client";

import { ArrowRight, CheckCircle, KeyRound, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  AuthCard,
  AuthLink,
  AuthNotice,
  PasswordField,
} from "@/components/auth/AuthCard";
import {
  DashboardButton,
  DashboardField,
  DashboardInput,
} from "@/components/dashboard/ui";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasToken = Boolean(searchParams.get("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Enter the email address attached to your owner account.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setLoading(false);
    setSent(true);
  };

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setLoading(false);
    router.push("/dashboard");
  };

  if (hasToken) {
    return (
      <AuthCard
        eyebrow="Reset password"
        title="Choose a new password"
        description="Enter a new password for your Moji owner account."
        footer={
          <p className="text-center text-sm text-gray-500">
            Remembered it? <AuthLink href="/login">Sign in</AuthLink>
          </p>
        }
      >
        <form onSubmit={handleReset} className="space-y-4">
          {error ? (
            <AuthNotice tone="error" title="Could not update password">
              {error}
            </AuthNotice>
          ) : null}

          <PasswordField
            id="password"
            label="New password"
            value={password}
            onChange={setPassword}
            placeholder="Min 8 characters"
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repeat password"
          />

          <DashboardButton type="submit" fullWidth disabled={loading}>
            {loading ? (
              "Updating password..."
            ) : (
              <>
                <KeyRound size={16} />
                Update password
                <ArrowRight size={16} />
              </>
            )}
          </DashboardButton>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Account recovery"
      title={sent ? "Reset link sent" : "Reset your password"}
      description={
        sent
          ? "Use the link in your inbox to choose a new password."
          : "Enter your owner email and we will send a secure reset link."
      }
      footer={
        <p className="text-center text-sm text-gray-500">
          Back to <AuthLink href="/login">sign in</AuthLink>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-green-100 bg-green-50 text-green-600">
            <CheckCircle size={28} />
          </div>
          <AuthNotice tone="success" title="Check your inbox">
            A mocked reset link has been sent to {email}. In production this
            would come from the authentication provider.
          </AuthNotice>
          <DashboardButton
            type="button"
            fullWidth
            variant="ghost"
            onClick={() => setSent(false)}
          >
            Try another email
          </DashboardButton>
        </div>
      ) : (
        <form onSubmit={handleRequest} className="space-y-4">
          {error ? (
            <AuthNotice tone="error" title="Check the email">
              {error}
            </AuthNotice>
          ) : null}

          <DashboardField id="email" label="Owner email">
            <DashboardInput
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="owner@restaurant.com"
              autoComplete="email"
              required
            />
          </DashboardField>

          <DashboardButton type="submit" fullWidth disabled={loading}>
            {loading ? (
              "Sending link..."
            ) : (
              <>
                <Mail size={16} />
                Send reset link
              </>
            )}
          </DashboardButton>
        </form>
      )}
    </AuthCard>
  );
}
