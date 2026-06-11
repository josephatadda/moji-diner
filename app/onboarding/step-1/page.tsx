"use client";

import {
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AuthSelectionCard,
  SetupActionFooter,
  SetupStepHeader,
} from "@/components/auth/AuthCard";
import {
  DashboardButton,
  DashboardField,
  DashboardInput,
} from "@/components/dashboard/ui";

type CuisineOption = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

const cuisines: CuisineOption[] = [
  {
    id: "african",
    title: "African & Local",
    description: "Traditional local dishes and regional specialties.",
    tags: ["Jollof Rice", "Suya", "Egusi", "Grills"],
  },
  {
    id: "continental",
    title: "Continental & Fast Food",
    description: "Burgers, pizzas, salads, and modern international plates.",
    tags: ["Burgers", "Pizza", "Pasta", "Chicken"],
  },
  {
    id: "bakery",
    title: "Café & Bakery",
    description: "Pastries, coffee, desserts, and breakfast favorites.",
    tags: ["Coffee", "Pastries", "Breakfast", "Tea"],
  },
  {
    id: "fine-dining",
    title: "Fine Dining & Bar",
    description: "Curated dining, cocktails, and premium spirits.",
    tags: ["Cocktails", "Steaks", "Wine", "Seafood"],
  },
];

const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

export default function Step1Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("african");
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "empty" | "error"
  >("empty");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedName = sessionStorage.getItem("onboarding_name") || "";
    const savedSlug = sessionStorage.getItem("onboarding_slug") || "";
    const savedCity = sessionStorage.getItem("onboarding_city") || "";
    const savedPhone = sessionStorage.getItem("onboarding_phone") || "";
    const savedInstagram = sessionStorage.getItem("onboarding_instagram") || "";
    const savedCuisine =
      sessionStorage.getItem("onboarding_cuisine") || "african";

    setName(savedName);
    setSlug(savedSlug);
    setCity(savedCity);
    setPhone(savedPhone);
    setInstagram(savedInstagram);
    setSelectedCuisine(savedCuisine);
    setSlugStatus(savedSlug ? "available" : "empty");
  }, []);

  useEffect(() => {
    if (!name.trim()) {
      setSlug("");
      setSlugStatus("empty");
      return;
    }

    setSlugStatus("checking");
    const timer = window.setTimeout(() => {
      setSlug(toSlug(name));
      setSlugStatus("available");
    }, 300);

    return () => window.clearTimeout(timer);
  }, [name]);

  const handleSlugChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextSlug = toSlug(event.target.value);
    setSlug(nextSlug);

    if (!nextSlug) {
      setSlugStatus("empty");
      return;
    }

    setSlugStatus("checking");
    try {
      const res = await fetch(
        `/api/onboarding/check-slug?slug=${encodeURIComponent(nextSlug)}`,
      );
      const json = await res.json();
      setSlugStatus(res.ok && json.data?.available ? "available" : "error");
    } catch {
      setSlugStatus("available");
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your restaurant name.");
      return;
    }

    if (!slug.trim()) {
      setError("Please enter a workspace URL.");
      return;
    }

    if (!city.trim()) {
      setError("Please enter your restaurant city.");
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    const phoneRegex = /^(?:\+234|0)[789][01]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError(
        "Please enter a valid Nigerian phone number, like 08031234567 or +2348031234567.",
      );
      return;
    }

    sessionStorage.setItem("onboarding_name", name.trim());
    sessionStorage.setItem("onboarding_slug", slug.trim());
    sessionStorage.setItem("onboarding_city", city.trim());
    sessionStorage.setItem("onboarding_phone", cleanPhone);
    sessionStorage.setItem("onboarding_instagram", instagram.trim());
    sessionStorage.setItem("onboarding_cuisine", selectedCuisine);

    router.push("/onboarding/step-2");
  };

  return (
    <div className="flex min-h-full flex-col">
      <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
        <div className="space-y-8 pb-8">
          <SetupStepHeader
            step="Step 1 of 2"
            title="Restaurant details"
            description="Set up the public identity diners will see on menus, receipts, QR codes, and connected experiences."
          />

          {error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-400">
                <ImagePlus className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Logo upload
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Placeholder for now. Add or update the restaurant mark later
                  in settings.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <DashboardField id="restaurantName" label="Restaurant name">
                <DashboardInput
                  id="restaurantName"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Mama Put Kitchen"
                  required
                />
              </DashboardField>
            </div>

            <div className="sm:col-span-2">
              <DashboardField
                id="restaurantSlug"
                label="Workspace URL"
                hint={
                  slugStatus === "available" && slug
                    ? `Available: moji.diner/${slug}`
                    : undefined
                }
                error={
                  slugStatus === "error"
                    ? "This workspace URL is already taken."
                    : undefined
                }
              >
                <div className="relative flex items-stretch">
                  <span className="flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-400">
                    moji.diner/
                  </span>
                  <DashboardInput
                    id="restaurantSlug"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="mama-put-kitchen"
                    required
                    className="rounded-l-none"
                  />
                  {slugStatus === "checking" ? (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                  ) : slugStatus === "available" && slug ? (
                    <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600" />
                  ) : null}
                </div>
              </DashboardField>
            </div>

            <DashboardField id="restaurantCity" label="City">
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <DashboardInput
                  id="restaurantCity"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Uyo"
                  required
                  className="pl-10"
                />
              </div>
            </DashboardField>

            <DashboardField id="restaurantPhone" label="Phone number">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <DashboardInput
                  id="restaurantPhone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0803 123 4567"
                  required
                  className="pl-10"
                />
              </div>
            </DashboardField>

            <div className="sm:col-span-2">
              <DashboardField
                id="restaurantInstagram"
                label="Instagram"
                optional
              >
                <DashboardInput
                  id="restaurantInstagram"
                  value={instagram}
                  onChange={(event) => setInstagram(event.target.value)}
                  placeholder="@mamaputkitchen"
                />
              </DashboardField>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="block text-xs font-medium text-gray-500">
                Primary cuisine
              </span>
              <p className="mt-0.5 text-[11px] text-gray-400">
                Select the category that best describes the menu.
              </p>
            </div>

            <div className="grid gap-3">
              {cuisines.map((cuisine) => {
                const isSelected = selectedCuisine === cuisine.id;

                return (
                  <AuthSelectionCard
                    key={cuisine.id}
                    selected={isSelected}
                    onClick={() => setSelectedCuisine(cuisine.id)}
                  >
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {cuisine.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                          {cuisine.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {cuisine.tags.map((tag) => (
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
        </div>

        <SetupActionFooter className="mt-auto">
          <DashboardButton variant="ghost" disabled>
            Back
          </DashboardButton>
          <DashboardButton type="submit" className="gap-2">
            Continue
            <ArrowRight className="h-3.5 w-3.5" />
          </DashboardButton>
        </SetupActionFooter>
      </form>
    </div>
  );
}
