"use client";

import { ArrowLeft, Check, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import {
  AuthSelectionCard,
  SetupActionFooter,
  SetupStepHeader,
} from "@/components/auth/AuthCard";
import { DashboardButton } from "@/components/dashboard/ui";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";

type MenuPdfTemplate = {
  id: "classic" | "modern" | "elegant";
  title: string;
  description: string;
  tags: string[];
};

const templates: MenuPdfTemplate[] = [
  {
    id: "classic",
    title: "Classic list",
    description: "Compact columns with clear sections and readable pricing.",
    tags: ["Compact", "Printable", "Simple"],
  },
  {
    id: "modern",
    title: "Modern menu",
    description: "Spacious sections and bold item grouping for casual dining.",
    tags: ["Spacious", "Clean", "Casual"],
  },
  {
    id: "elegant",
    title: "Elegant dining",
    description: "A quieter layout for premium menus and curated specials.",
    tags: ["Premium", "Calm", "Editorial"],
  },
];

export default function Step2Page() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<
    "classic" | "modern" | "elegant"
  >("classic");
  const [restaurantSlug, setRestaurantSlug] = useState("mama-put-kitchen");
  const [restaurantName, setRestaurantName] = useState("Mama Put Kitchen");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const setPdfTemplate = useDashboardSettingsStore(
    (state) => state.setPdfTemplate,
  );

  useEffect(() => {
    const savedSlug =
      sessionStorage.getItem("onboarding_slug") || "mama-put-kitchen";
    const savedName =
      sessionStorage.getItem("onboarding_name") || "Mama Put Kitchen";
    const savedTemplate = sessionStorage.getItem("onboarding_template") as
      | "classic"
      | "modern"
      | "elegant"
      | null;

    setRestaurantSlug(savedSlug);
    setRestaurantName(savedName);
    if (savedTemplate) setSelectedTemplate(savedTemplate);
  }, []);

  const handleBack = () => {
    sessionStorage.setItem("onboarding_template", selectedTemplate);
    router.push("/onboarding/step-1");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const name = sessionStorage.getItem("onboarding_name") || "";
      const slug = sessionStorage.getItem("onboarding_slug") || "";
      const phone = sessionStorage.getItem("onboarding_phone") || "";
      const cuisine =
        sessionStorage.getItem("onboarding_cuisine") || "nigerian";

      let normalizedPhone = phone.replace(/\s+/g, "");
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = `+234${normalizedPhone.slice(1)}`;
      }

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: { name, slug, phone: normalizedPhone, cuisines: [cuisine] },
          tables: { tableCount: 1, templates: ["standard"] },
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json?.error ?? "Setup failed. Please try again.");
        return;
      }

      setPdfTemplate(selectedTemplate);

      [
        "onboarding_name",
        "onboarding_slug",
        "onboarding_city",
        "onboarding_phone",
        "onboarding_instagram",
        "onboarding_cuisine",
        "onboarding_template",
        "onboarding_complete",
      ].forEach((key) => {
        sessionStorage.removeItem(key);
      });

      sessionStorage.setItem("onboarding_complete", "true");
      toast.success("Restaurant set up successfully. Welcome to Moji.");
      router.push("/dashboard");
    } catch {
      setSubmitError(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewUrl = `https://moji.diner/${restaurantSlug}`;

  return (
    <div className="flex min-h-full flex-col">
      <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
        <div className="space-y-8 pb-8">
          <SetupStepHeader
            step="Step 2 of 2"
            title="Menu launch kit"
            description="Review the public menu link and choose a PDF style. You can refine menu items, branding, and exports from the dashboard."
          />

          <div className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-5 sm:flex-row sm:items-center">
            <div className="flex-none rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <QRCode value={previewUrl} size={112} className="h-28 w-28" />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Public menu link
                </span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900">
                {restaurantName}
              </h4>
              <p className="text-xs leading-5 text-gray-500">
                This link is ready for your public menu. Share or print it when
                your menu is finalized.
              </p>
              <p className="truncate font-mono text-[11px] text-gray-400">
                {previewUrl}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="block text-xs font-medium text-gray-500">
                PDF menu style
              </span>
              <p className="mt-0.5 text-[11px] text-gray-400">
                Pick the starting layout for menu downloads. This can be changed
                later.
              </p>
            </div>

            <div className="grid gap-3">
              {templates.map((template) => {
                const isSelected = selectedTemplate === template.id;

                return (
                  <AuthSelectionCard
                    key={template.id}
                    selected={isSelected}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {template.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                          {template.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {template.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </AuthSelectionCard>
                );
              })}
            </div>
          </div>

          {submitError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {submitError}
            </div>
          ) : null}
        </div>

        <SetupActionFooter className="mt-auto">
          <DashboardButton
            type="button"
            variant="ghost"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </DashboardButton>
          <DashboardButton
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? "Setting up..." : "Complete setup"}
            <Check className="h-3.5 w-3.5" />
          </DashboardButton>
        </SetupActionFooter>
      </form>
    </div>
  );
}
