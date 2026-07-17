"use client";

import { ArrowLeft, Check, Download, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { SetupActionFooter, SetupStepHeader } from "@/components/auth/AuthCard";
import { DashboardButton } from "@/components/dashboard/ui";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";

export default function Step2Page() {
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);
  const [restaurantSlug, setRestaurantSlug] = useState("mama-put-kitchen");
  const [restaurantName, setRestaurantName] = useState("Mama Put Kitchen");
  const [city, setCity] = useState("Uyo");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateProfile = useDashboardSettingsStore(
    (state) => state.updateProfile,
  );

  useEffect(() => {
    setRestaurantSlug(
      sessionStorage.getItem("onboarding_slug") || "mama-put-kitchen",
    );
    setRestaurantName(
      sessionStorage.getItem("onboarding_name") || "Mama Put Kitchen",
    );
    setCity(sessionStorage.getItem("onboarding_city") || "Uyo");
    setPhone(sessionStorage.getItem("onboarding_phone") || "");
  }, []);

  const previewUrl = `https://moji.diner/${restaurantSlug}`;

  const handleBack = () => {
    router.push("/onboarding/step-1");
  };

  const handleDownloadQr = async () => {
    const svg = qrRef.current?.querySelector("svg");

    if (!svg) {
      toast.error("QR code is not ready yet.");
      return;
    }

    const clonedSvg = svg.cloneNode(true) as SVGElement;
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgText = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${restaurantSlug || "moji-menu"}-qr.svg`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    window.dispatchEvent(
      new CustomEvent("moji:qr-download", {
        detail: { filename: link.download },
      }),
    );
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("QR code downloaded.");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const name = sessionStorage.getItem("onboarding_name") || restaurantName;
    const slug = sessionStorage.getItem("onboarding_slug") || restaurantSlug;
    const savedCity = sessionStorage.getItem("onboarding_city") || city;
    const savedPhone = sessionStorage.getItem("onboarding_phone") || phone;

    updateProfile({
      name,
      slug,
      city: savedCity,
      phone: savedPhone,
    });

    [
      "onboarding_name",
      "onboarding_slug",
      "onboarding_city",
      "onboarding_phone",
      "onboarding_instagram",
      "onboarding_cuisine",
    ].forEach((key) => {
      sessionStorage.removeItem(key);
    });

    sessionStorage.setItem("onboarding_complete", "true");
    toast.success("Restaurant setup complete. Welcome to Moji.");
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-full flex-col">
      <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
        <div className="space-y-8 pb-8">
          <SetupStepHeader
            step="Step 2 of 2"
            title="Menu QR"
            description="Your public menu link is ready. Download the QR code now or come back to it from dashboard settings later."
          />

          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div
                ref={qrRef}
                className="flex flex-none items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                <QRCode
                  value={previewUrl}
                  size={132}
                  className="h-[132px] w-[132px]"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                      Public menu link
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      {restaurantName}
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Diners can scan this code to open your live menu.
                    </p>
                  </div>
                  <p className="truncate rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-500">
                    {previewUrl}
                  </p>
                </div>

                <DashboardButton
                  type="button"
                  variant="ghost"
                  onClick={handleDownloadQr}
                  className="gap-2"
                  fullWidth
                >
                  <Download className="h-4 w-4" />
                  Download QR code
                </DashboardButton>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
            <p className="text-sm font-medium text-green-900">
              You can edit menu items, branding, QR downloads, and optional
              modules from the dashboard after setup.
            </p>
          </div>
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
            {isSubmitting ? "Finishing..." : "Complete setup"}
            <Check className="h-3.5 w-3.5" />
          </DashboardButton>
        </SetupActionFooter>
      </form>
    </div>
  );
}
