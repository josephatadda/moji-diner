"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);

    // Route based on actual account state (stored in sessionStorage onboarding_complete)
    const isCompleted = sessionStorage.getItem("onboarding_complete") === "true";
    if (isCompleted) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="space-y-6">
      <AuthCard
        title="Log in"
        description="Access your restaurant dashboard, manage tables, and keep operations in sync."
      >
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <AuthNotice tone="error" title="Could not sign in">
              {error}
            </AuthNotice>
          )}

          <div className="space-y-4">
            <DashboardField id="email" label="Email address">
              <DashboardInput
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="owner@restaurant.com"
                autoComplete="email"
                required
                className="h-11 rounded-xl"
              />
            </DashboardField>

            <div>
              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Min 8 characters"
              />
              <div className="flex justify-end mt-2">
                <AuthLink href="/reset-password">Forgot password?</AuthLink>
              </div>
            </div>
          </div>

          <DashboardButton type="submit" fullWidth disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </DashboardButton>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-bold tracking-wider text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* Google Button - Using standard DashboardButton */}
          <DashboardButton variant="ghost" fullWidth>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" role="img" aria-label="Google">
              <title>Google</title>
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.58 15 1 12 1 7.24 1 3.2 3.73 1.24 7.74l3.85 2.99C6.01 7.24 8.78 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.9c2.18-2.01 3.7-4.96 3.7-8.63z"
              />
              <path
                fill="#FBBC05"
                d="M5.09 14.73c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.24 7.38C.45 8.97 0 10.74 0 12.6s.45 3.63 1.24 5.22l3.85-3.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.73-2.9c-1.1.74-2.51 1.18-4.23 1.18-3.22 0-5.99-2.2-6.96-5.18L1.19 16.2c1.96 4.01 6 6.8 10.81 6.8z"
              />
            </svg>
            Continue with Google
          </DashboardButton>
        </form>
      </AuthCard>

      <div className="text-center space-y-2">
        <p className="text-xs text-gray-400">
          New to Moji? <Link href="/signup" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">Create an account</Link>
        </p>
        <div>
          <Link href="/staff-login" className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
            Are you restaurant staff? Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
