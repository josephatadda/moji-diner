import { create } from "zustand";
import { MOCK_RESTAURANT, MOCK_USER } from "@/lib/mockData";

export type DashboardFeature =
  | "menu"
  | "orders"
  | "tables"
  | "payments"
  | "loyalty"
  | "analytics"
  | "staff"
  | "notifications"
  | "integrations";

export type RestaurantProfileSettings = {
  name: string;
  slug: string;
  description: string;
  city: string;
  phone: string;
  acceptingOrders: boolean;
  logoUrl?: string;
  coverImageUrl?: string;
  address?: string;
  email?: string;
  currency?: string;
};

export type TaxSettings = {
  vatEnabled: boolean;
  vatRate: number;
  serviceChargeEnabled: boolean;
  serviceChargeRate: number;
};

type DashboardSettingsState = {
  features: Record<DashboardFeature, boolean>;
  profile: RestaurantProfileSettings;
  taxes: TaxSettings;
  pdfTemplate: "classic" | "modern" | "elegant";
  setFeatureEnabled: (feature: DashboardFeature, enabled: boolean) => void;
  updateProfile: (profile: Partial<RestaurantProfileSettings>) => void;
  updateTaxes: (taxes: Partial<TaxSettings>) => void;
  setPdfTemplate: (template: "classic" | "modern" | "elegant") => void;
};

export const FEATURE_LABELS: Record<DashboardFeature, string> = {
  menu: "Menu",
  orders: "Orders",
  tables: "Tables & QR",
  payments: "Transactions",
  loyalty: "Loyalty",
  analytics: "Analytics",
  staff: "Staff access",
  notifications: "Notifications",
  integrations: "Integrations",
};

export const useDashboardSettingsStore = create<DashboardSettingsState>()(
  (set) => ({
    features: {
      menu: true,
      orders: true,
      tables: false, // suspended for MVP by default
      payments: true, // active by default for manual transactions
      loyalty: false, // out of scope loyalty by default
      analytics: true,
      staff: true,
      notifications: true,
      integrations: false,
    },
    profile: {
      name: MOCK_RESTAURANT.name,
      slug: MOCK_RESTAURANT.slug,
      description: MOCK_RESTAURANT.description,
      city: MOCK_RESTAURANT.city,
      phone: MOCK_RESTAURANT.phone,
      acceptingOrders: MOCK_RESTAURANT.isAcceptingOrders,
      logoUrl:
        MOCK_RESTAURANT.logoUrl ||
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=120&h=120&q=80",
      coverImageUrl:
        MOCK_RESTAURANT.coverImageUrl ||
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&h=400&q=80",
      address: "12 Hospital Road, Uyo, Akwa Ibom, Nigeria",
      email: MOCK_USER.email,
      currency: MOCK_RESTAURANT.currency,
    },
    taxes: {
      vatEnabled: MOCK_RESTAURANT.vatEnabled,
      vatRate: MOCK_RESTAURANT.vatRate,
      serviceChargeEnabled: false,
      serviceChargeRate: 5,
    },
    pdfTemplate: "classic",
    setFeatureEnabled: (feature, enabled) =>
      set((state) => ({
        features: {
          ...state.features,
          [feature]: feature === "menu" ? true : enabled,
        },
      })),
    updateProfile: (profile) =>
      set((state) => ({
        profile: {
          ...state.profile,
          ...profile,
        },
      })),
    updateTaxes: (taxes) =>
      set((state) => ({
        taxes: {
          ...state.taxes,
          ...taxes,
        },
      })),
    setPdfTemplate: (template) => set({ pdfTemplate: template }),
  }),
);
