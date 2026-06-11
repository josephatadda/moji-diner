"use client";

import { ArrowLeft, Check, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";

type MenuPdfTemplate = {
  id: "classic" | "modern" | "elegant";
  title: string;
  description: string;
  tags: string[];
};

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

  const templates: MenuPdfTemplate[] = [
    {
      id: "classic",
      title: "Classic & Standard Layout",
      description:
        "Classical columns with clear typography. Best for traditional menus.",
      tags: ["Compact fit", "Standard list", "Highly readable"],
    },
    {
      id: "modern",
      title: "Modern Minimalist",
      description:
        "Bold headers with spacious, clean layouts. Best for cafes and grills.",
      tags: ["Sleek fonts", "Generous spacing", "Contemporary feel"],
    },
    {
      id: "elegant",
      title: "Elegant Lounge",
      description:
        "Premium centered text with decorative divider rules. Best for fine dining.",
      tags: ["Decorative lines", "Sophisticated style", "Centered layout"],
    },
  ];

  // Retrieve restaurant slug from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
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
    }
  }, []);

  const handleBack = () => {
    // Save current state first
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

      // Formulate phone to comply with strict "+234..." backend Zod validation if it starts with 0
      let normalizedPhone = phone.replace(/\s+/g, "");
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = `+234${normalizedPhone.slice(1)}`;
      }

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: { name, slug, phone: normalizedPhone, cuisines: [cuisine] },
          tables: { tableCount: 1, templates: ["standard"] }, // default counter tables setup internally
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json?.error ?? "Setup failed. Please try again.");
        return;
      }

      // Update Zustand local store for PDF preference
      setPdfTemplate(selectedTemplate);

      // Clean up sessionStorage
      [
        "onboarding_name",
        "onboarding_slug",
        "onboarding_phone",
        "onboarding_cuisine",
        "onboarding_tables",
        "onboarding_template",
        "onboarding_complete",
      ].forEach((k) => {
        sessionStorage.removeItem(k);
      });

      toast.success(
        "Restaurant set up successfully! View your dashboard to begin.",
      );
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
    <div className="space-y-8">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
          Step 2 of 2
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">
          QR Code & Menu PDF Template
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Your main menu QR code is ready. Select a styling template to format
          your menu PDF.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main QR Code Preview Card */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-white space-y-4 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex-none">
            <QRCode value={previewUrl} size={110} className="w-28 h-28" />
          </div>
          <div className="text-center sm:text-left space-y-2 flex-grow min-w-0">
            <div className="flex justify-center sm:justify-start items-center gap-2">
              <QrCode className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                Main Menu QR Code
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-gray-900">
              {restaurantName} QR Code
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              This is the single primary QR code for your restaurant. Customers
              scan it to browse your menu and order.
            </p>
            <p className="text-[11px] text-gray-400 truncate font-mono">
              Link: <span className="underline">{previewUrl}</span>
            </p>
          </div>
        </div>

        {/* Menu Templates selectors */}
        <div className="space-y-3">
          <div>
            <span className="block text-xs font-semibold text-gray-500">
              Select Menu PDF Style Template
            </span>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Choose the layout design style for menu PDF exports. This can be
              changed later.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {templates.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.id;

              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`text-left flex items-start gap-4 p-4 rounded-2xl border transition-all relative group cursor-pointer ${
                    isSelected
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
                  }`}
                >
                  {/* Checkbox state */}
                  <div className="mt-0.5 flex-none">
                    {isSelected ? (
                      <div className="h-5 w-5 rounded-full bg-gray-900 flex items-center justify-center text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-gray-200 bg-white group-hover:border-gray-300"></div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {tmpl.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {tmpl.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isSelected
                              ? "bg-gray-200 text-gray-800"
                              : "bg-gray-100 text-gray-500 group-hover:bg-gray-200/50"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
            {submitError}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-6 mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider bg-white hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? "Setting up…" : "Complete Setup"}</span>
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
