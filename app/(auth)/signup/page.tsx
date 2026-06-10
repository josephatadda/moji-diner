"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AuthCard,
  AuthNotice,
  PasswordField,
} from "@/components/auth/AuthCard";
import {
  DashboardButton,
  DashboardField,
  DashboardInput,
} from "@/components/dashboard/ui";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!restaurantName.trim()) {
      setError("Add your restaurant name to continue.");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLoading(false);

    // Clear onboarding completed state for new registrations
    sessionStorage.removeItem("onboarding_complete");

    // Redirect to verify-email page with email query param
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="space-y-6">
      <AuthCard
        title="Register"
        description="Set up your owner account first. Restaurant details and dining tables will be configured next."
      >
        <form onSubmit={handleSignup} className="space-y-6">
          {error && (
            <AuthNotice tone="error" title="Check the form">
              {error}
            </AuthNotice>
          )}

          <div className="space-y-4">
            <DashboardField id="restaurantName" label="Restaurant name">
              <DashboardInput
                id="restaurantName"
                value={restaurantName}
                onChange={(event) => setRestaurantName(event.target.value)}
                placeholder="Mama Put Kitchen"
                autoComplete="organization"
                required
                className="h-11 rounded-xl"
              />
            </DashboardField>

            <DashboardField id="email" label="Owner email">
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

            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Min 8 characters"
              hint="Use at least 8 characters."
            />
          </div>

          <DashboardButton type="submit" fullWidth disabled={loading}>
            {loading ? "Creating workspace..." : "Register"}
          </DashboardButton>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-bold tracking-wider text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* Google Button */}
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

      <div className="text-center">
        <p className="text-xs text-gray-400">
          Already registered? <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
