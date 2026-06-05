import { create } from "zustand";
import { MOCK_RESTAURANT } from "@/lib/mockData";

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
  setFeatureEnabled: (feature: DashboardFeature, enabled: boolean) => void;
  updateProfile: (profile: Partial<RestaurantProfileSettings>) => void;
  updateTaxes: (taxes: Partial<TaxSettings>) => void;
};

export const FEATURE_LABELS: Record<DashboardFeature, string> = {
  menu: "Menu",
  orders: "Orders",
  tables: "Tables & QR",
  payments: "Payments",
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
      tables: true,
      payments: true,
      loyalty: MOCK_RESTAURANT.loyaltyEnabled,
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
    },
    taxes: {
      vatEnabled: MOCK_RESTAURANT.vatEnabled,
      vatRate: MOCK_RESTAURANT.vatRate,
      serviceChargeEnabled: false,
      serviceChargeRate: 5,
    },
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
  }),
);
