"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <AuthCard
      title="Sign in"
      description="Access your restaurant dashboard, manage modules, and keep your diner experience in sync."
      footer={
        <p className="text-center text-sm text-gray-500">
          New to Moji? <AuthLink href="/signup">Create an account</AuthLink>
        </p>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {error ? (
          <AuthNotice tone="error" title="Could not sign in">
            {error}
          </AuthNotice>
        ) : (
          <AuthNotice title="Demo access">
            Use any valid email and an 8+ character password to enter the mock
            dashboard.
          </AuthNotice>
        )}

        <DashboardField id="email" label="Email address">
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

        <PasswordField
          id="password"
          label="Password"
          labelAction={
            <AuthLink href="/reset-password">Forgot password?</AuthLink>
          }
          value={password}
          onChange={setPassword}
          placeholder="Min 8 characters"
        />

        <DashboardButton type="submit" fullWidth disabled={loading}>
          {loading ? (
            "Signing in..."
          ) : (
            <>
              <LockKeyhole size={16} />
              Sign in
              <ArrowRight size={16} />
            </>
          )}
        </DashboardButton>
      </form>
    </AuthCard>
  );
}
