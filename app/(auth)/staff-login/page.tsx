"use client";

import { BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthCard,
  AuthNotice,
  AuthPromoCard,
  PinInput,
} from "@/components/auth/AuthCard";
import {
  DashboardButton,
  DashboardField,
  DashboardInput,
} from "@/components/dashboard/ui";

const knownRestaurants: Record<string, string> = {
  "mama-put-kitchen": "Mama Put Kitchen",
  "spice-garden-lagos": "Spice Garden Lagos",
};

export default function StaffLoginPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("mama-put-kitchen");
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const restaurantName = knownRestaurants[slug.trim().toLowerCase()];

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!restaurantName) {
      setError("We could not find that restaurant workspace.");
      return;
    }

    if (pin.length !== 4) {
      setError("Enter your 4-digit staff PIN.");
      return;
    }

    if (attempts >= 4) {
      setError("Too many attempts. Ask a manager to reset your PIN.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);

    if (pin !== "1234") {
      setAttempts((current) => current + 1);
      setError("Incorrect PIN. Try 1234 for this mock login.");
      return;
    }

    router.push("/dashboard/orders");
  };

  return (
    <AuthCard
      title="Staff Log in"
      description="Sign in with your restaurant workspace and PIN to manage the active order queue."
      footer={
        <AuthPromoCard
          href="/login"
          title="Owner account?"
          subtitle="Sign in to your owner dashboard"
        />
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {error ? (
          <AuthNotice tone="error" title="Could not verify PIN">
            {error}
          </AuthNotice>
        ) : (
          <AuthNotice title="Demo staff PIN">
            Use <span className="font-semibold">1234</span> for the mocked staff
            login.
          </AuthNotice>
        )}

        <DashboardField
          id="restaurantSlug"
          label="Restaurant workspace"
          hint="Use the restaurant slug from the diner URL."
        >
          <DashboardInput
            id="restaurantSlug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="mama-put-kitchen"
            autoComplete="organization"
            required
            className="h-11 rounded-xl"
          />
        </DashboardField>

        {restaurantName ? (
          <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-3 text-green-700">
            <BadgeCheck size={18} />
            <div>
              <p className="text-sm font-semibold">{restaurantName}</p>
              <p className="text-xs">Workspace found</p>
            </div>
          </div>
        ) : null}

        <PinInput value={pin} onChange={setPin} />

        <DashboardButton type="submit" fullWidth disabled={loading}>
          {loading ? "Checking PIN..." : "Continue"}
        </DashboardButton>
      </form>
    </AuthCard>
  );
}
