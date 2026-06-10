"use client";

import { ArrowLeft, Check, Minus, Plus, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

type LayoutTemplate = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

export default function Step2Page() {
  const router = useRouter();
  const [tableCount, setTableCount] = useState<number>(8);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("standard");
  const [restaurantSlug, setRestaurantSlug] = useState("mama-put-kitchen");
  const [_restaurantName, setRestaurantName] = useState("Mama Put Kitchen");

  const templates: LayoutTemplate[] = [
    {
      id: "standard",
      title: "Standard Dining Tables",
      description:
        "Classical tables seating 2 to 4 guests. Ideal for casual dining.",
      tags: ["2-4 seats", "Casual layout", "Numbered 1..N"],
    },
    {
      id: "counter",
      title: "Bar & Counter Seating",
      description:
        "High stools arranged along counters. Great for quick service.",
      tags: ["Stool seating", "Single diners", "Quick turns"],
    },
    {
      id: "mixed",
      title: "Mixed / Lounge Seating",
      description: "A combination of lounges, booths, and standard tables.",
      tags: ["High capacity", "Group dining", "VIP booths"],
    },
  ];

  // Retrieve restaurant slug from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSlug =
        sessionStorage.getItem("onboarding_slug") || "mama-put-kitchen";
      const savedName =
        sessionStorage.getItem("onboarding_name") || "Mama Put Kitchen";
      const savedTableCount = sessionStorage.getItem("onboarding_tables");
      const savedTemplate = sessionStorage.getItem("onboarding_template");

      setRestaurantSlug(savedSlug);
      setRestaurantName(savedName);
      if (savedTableCount) setTableCount(Number(savedTableCount));
      if (savedTemplate) setSelectedTemplate(savedTemplate);
    }
  }, []);

  const handleMinus = () => {
    setTableCount((prev) => Math.max(1, prev - 1));
  };

  const handlePlus = () => {
    setTableCount((prev) => Math.min(50, prev + 1));
  };

  const handleBack = () => {
    // Save current state first
    sessionStorage.setItem("onboarding_tables", String(tableCount));
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

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: { name, slug, phone, cuisines: [cuisine] },
          tables: { tableCount },
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json?.error ?? "Setup failed. Please try again.");
        return;
      }

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

      toast.success("You're live! Download your QR codes to get started.");
      router.push("/dashboard");
    } catch {
      setSubmitError(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewUrl = `https://moji.diner/${restaurantSlug}/t/1`;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
          Step 2 of 2
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">
          Set Up Tables
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Configure how many tables your restaurant has and select a layout
          style.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Table count stepper widget */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-bold text-gray-900">
                Number of tables
              </span>
              <p className="text-xs text-gray-400 mt-0.5">
                Specify active tables for diner QR ordering.
              </p>
            </div>

            {/* Stepper controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleMinus}
                className="h-9 w-9 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all flex items-center justify-center active:scale-90"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-bold text-gray-900 text-base">
                {tableCount}
              </span>
              <button
                type="button"
                onClick={handlePlus}
                className="h-9 w-9 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all flex items-center justify-center active:scale-90"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stepper Template cards (Column style checkable card stack) */}
        <div className="space-y-3">
          <div>
            <span className="block text-xs font-medium text-gray-500">
              Seating templates
            </span>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Select a template to group and structure tables.
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

                    {/* Custom Tags */}
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

        {/* Live QR Code Card Preview */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-white space-y-4 flex flex-col sm:flex-row items-center gap-6">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex-none">
            <QRCode value={previewUrl} size={110} className="w-28 h-28" />
          </div>
          <div className="text-center sm:text-left space-y-2 flex-grow">
            <div className="flex justify-center sm:justify-start items-center gap-2">
              <QrCode className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                Live Preview
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-gray-900">
              Table 1 QR Code
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              Each of your{" "}
              <span className="font-bold text-gray-900">
                {tableCount} tables
              </span>{" "}
              will have a unique QR code. Diners scan it to order directly to
              the kitchen.
            </p>
            <p className="text-[11px] text-gray-400 truncate max-w-[280px]">
              Diner link:{" "}
              <span className="underline font-mono">{previewUrl}</span>
            </p>
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
            {submitError}
          </div>
        )}

        {/* Column-style Footer */}
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
