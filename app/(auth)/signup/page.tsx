"use client";

import { ArrowRight, MailCheck, Store } from "lucide-react";
import Link from "next/link";
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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
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
    setSent(true);
  };

  if (sent) {
    return (
      <AuthCard
        eyebrow="Verify account"
        title="Check your email"
        description="We sent a verification link so you can finish setting up your restaurant workspace."
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
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
            <p className="text-xs font-medium text-gray-400">
              Verification sent to
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{email}</p>
          </div>
          <DashboardButton
            type="button"
            fullWidth
            onClick={() => setSent(false)}
            variant="ghost"
          >
            Edit email address
          </DashboardButton>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your workspace"
      description="Set up your owner account first. Restaurant details, modules, and payments can be configured after verification."
      footer={
        <p className="text-center text-sm text-gray-500">
          Already registered? <AuthLink href="/login">Sign in</AuthLink>
        </p>
      }
    >
      <form onSubmit={handleSignup} className="space-y-4">
        {error ? (
          <AuthNotice tone="error" title="Check the form">
            {error}
          </AuthNotice>
        ) : null}

        <DashboardField id="restaurantName" label="Restaurant name">
          <DashboardInput
            id="restaurantName"
            value={restaurantName}
            onChange={(event) => setRestaurantName(event.target.value)}
            placeholder="Mama Put Kitchen"
            autoComplete="organization"
            required
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

        <DashboardButton type="submit" fullWidth disabled={loading}>
          {loading ? (
            "Creating workspace..."
          ) : (
            <>
              <Store size={16} />
              Create workspace
              <ArrowRight size={16} />
            </>
          )}
        </DashboardButton>
      </form>

      <p className="mt-4 text-center text-xs leading-5 text-gray-400">
        By creating an account, you agree to Moji&apos;s{" "}
        <Link href="#" className="underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthCard>
  );
}
