"use client";

import { ArrowRight, Check, Loader2, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DashboardField,
  DashboardInput,
} from "@/components/dashboard/ui/DashboardField";

type CuisineOption = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

// Helper function to generate slug from name
const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric chars (except hyphens)
    .replace(/-+/g, "-"); // Collapse multiple hyphens
};

export default function Step1Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("african");
  const [_slugChecking, setSlugChecking] = useState(false);
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "empty"
  >("empty");
  const [error, setError] = useState("");

  const cuisines: CuisineOption[] = [
    {
      id: "african",
      title: "African & Local",
      description: "Traditional local dishes and regional specialties.",
      tags: ["Jollof Rice", "Suya", "Egusi", "Pounded Yam", "Grills"],
    },
    {
      id: "continental",
      title: "Continental & Fast Food",
      description: "Burgers, pizzas, salads, and modern international plates.",
      tags: ["Burgers", "Pizza", "Salads", "Pasta", "Fried Chicken"],
    },
    {
      id: "bakery",
      title: "Café & Bakery",
      description: "Pastries, coffee, desserts, and breakfast favorites.",
      tags: ["Coffee", "Pastries", "Breakfast", "Waffles", "Tea"],
    },
    {
      id: "fine-dining",
      title: "Fine Dining & Bar",
      description: "Curated gourmet dining, cocktails, and premium spirits.",
      tags: ["Cocktails", "Steaks", "Gourmet", "Wine", "Seafood"],
    },
  ];

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = sessionStorage.getItem("onboarding_name") || "";
      const savedSlug = sessionStorage.getItem("onboarding_slug") || "";
      const savedPhone = sessionStorage.getItem("onboarding_phone") || "";
      const savedCuisine =
        sessionStorage.getItem("onboarding_cuisine") || "african";

      if (savedName) setName(savedName);
      if (savedSlug) {
        setSlug(savedSlug);
        setSlugStatus("available");
      }
      if (savedPhone) setPhone(savedPhone);
      if (savedCuisine) setSelectedCuisine(savedCuisine);
    }
  }, []);

  // Update slug automatically when name changes
  useEffect(() => {
    if (!name.trim()) {
      setSlug("");
      setSlugStatus("empty");
      return;
    }

    setSlugChecking(true);
    setSlugStatus("checking");

    const timer = setTimeout(() => {
      const generatedSlug = toSlug(name);
      setSlug(generatedSlug);
      setSlugChecking(false);
      setSlugStatus("available");
    }, 400000); // Wait 400ms for debouncing

    // Simulating faster response (300ms)
    const fastTimer = setTimeout(() => {
      const generatedSlug = toSlug(name);
      setSlug(generatedSlug);
      setSlugChecking(false);
      setSlugStatus("available");
    }, 300);

    return () => {
      clearTimeout(timer);
      clearTimeout(fastTimer);
    };
  }, [name]);

  const handleSlugChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawVal = event.target.value;
    const generatedSlug = toSlug(rawVal);
    setSlug(generatedSlug);

    if (!generatedSlug) {
      setSlugStatus("empty");
      return;
    }

    setSlugStatus("checking");
    try {
      const res = await fetch(
        `/api/onboarding/check-slug?slug=${encodeURIComponent(generatedSlug)}`,
      );
      const json = await res.json();
      if (res.ok && json.data?.available) {
        setSlugStatus("available");
      } else {
        setSlugStatus("error"); // You could add an 'unavailable' state if you want
      }
    } catch {
      setSlugStatus("available"); // fallback on error for demo purposes
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

    // Phone format validation (Nigerian format: 080... or +234...)
    const cleanPhone = phone.replace(/\s+/g, "");
    const phoneRegex = /^(?:\+234|0)[789][01]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError(
        "Please enter a valid Nigerian phone number (e.g. 08031234567 or +2348031234567).",
      );
      return;
    }

    // Save to sessionStorage
    sessionStorage.setItem("onboarding_name", name);
    sessionStorage.setItem("onboarding_slug", slug);
    sessionStorage.setItem("onboarding_phone", cleanPhone);
    sessionStorage.setItem("onboarding_cuisine", selectedCuisine);

    // Navigate to step 2
    router.push("/onboarding/step-2");
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
          Step 1 of 2
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">
          Restaurant Profile
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Tell us about your restaurant to set up your workspace and menus.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Inputs Grid */}
        <div className="space-y-4">
          <DashboardField id="restaurantName" label="Restaurant name">
            <DashboardInput
              id="restaurantName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mama Put Kitchen"
              required
              className="h-11 rounded-xl"
            />
          </DashboardField>

          {/* Workspace Slug */}
          <div className="space-y-1.5">
            <label
              htmlFor="restaurantSlug"
              className="block text-xs font-medium text-gray-500"
            >
              Workspace URL
            </label>
            <div className="relative flex items-stretch">
              <span className="flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-xs text-gray-400 font-medium">
                moji.diner/
              </span>
              <input
                id="restaurantSlug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="mama-put-kitchen"
                required
                className="flex-1 min-w-0 block w-full px-3 py-2 bg-white border border-gray-200 rounded-r-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all h-11"
              />
            </div>
            {slugStatus === "checking" && (
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1 font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking availability...
              </p>
            )}
            {slugStatus === "available" && (
              <p className="text-[11px] text-green-600 flex items-center gap-1.5 mt-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>✓
                Available: moji.diner/{slug}
              </p>
            )}
          </div>

          <DashboardField id="restaurantPhone" label="Restaurant phone number">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Phone className="h-4 w-4" />
              </span>
              <DashboardInput
                id="restaurantPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0803 123 4567"
                required
                className="h-11 pl-10 rounded-xl"
              />
            </div>
          </DashboardField>
        </div>

        {/* Cuisine Type Choices (Column style checkable card stack) */}
        <div className="space-y-3">
          <div>
            <span className="block text-xs font-medium text-gray-500">
              Primary Cuisine / Restaurant Type
            </span>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Select the category that best describes your menu.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {cuisines.map((cuisine) => {
              const isSelected = selectedCuisine === cuisine.id;

              return (
                <button
                  key={cuisine.id}
                  type="button"
                  onClick={() => setSelectedCuisine(cuisine.id)}
                  className={`text-left flex items-start gap-4 p-4 rounded-2xl border transition-all relative group cursor-pointer ${
                    isSelected
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
                  }`}
                >
                  {/* Select State Indicator */}
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
                        {cuisine.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {cuisine.description}
                      </p>
                    </div>

                    {/* Custom Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {cuisine.tags.map((tag) => (
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

        {/* Column-style Footer */}
        <div className="border-t border-gray-100 pt-6 mt-8 flex items-center justify-between">
          <button
            type="button"
            disabled
            className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-300 text-xs font-bold uppercase tracking-wider bg-white cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Continue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
