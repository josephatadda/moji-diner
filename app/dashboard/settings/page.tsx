"use client";

import {
  Bell,
  CheckCircle,
  Clock,
  Globe,
  InstagramLogo,
  Key,
  LockKey,
  Percent,
  Phone,
  QrCode,
  Storefront,
  TwitterLogo,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import {
  DashboardButton,
  DashboardField,
  DashboardInput,
  DashboardPageHeader,
  DashboardSelect,
  DashboardTextarea,
  dashboardToast,
  ds,
  Toggle,
  t,
} from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";

const TABS = [
  { id: "general", label: "General", icon: Storefront },
  // { id: "features", label: "Modules", icon: Sliders },
  { id: "hours", label: "Hours", icon: Clock },
  { id: "qr", label: "Menu QR & PDF", icon: QrCode },
  { id: "taxes", label: "Tax & VAT", icon: Percent },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: LockKey },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return <Toggle checked={checked} onChange={onChange} />;
}

function SaveButton({
  label = "Save changes",
  onSave,
}: {
  label?: string;
  onSave?: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    onSave?.();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    dashboardToast("Settings saved");
  };
  return (
    <DashboardButton
      onClick={handleSave}
      className={cn(saved && "bg-green-600 hover:bg-green-600")}
    >
      {saved && <CheckCircle size={15} weight="bold" />}
      {saved ? "Saved" : label}
    </DashboardButton>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={ds.card.base}>
      <div className={ds.card.header}>
        <p className={t.h4}>{title}</p>
      </div>
      <div className={`${ds.card.body} space-y-4`}>{children}</div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <DashboardField id={id} label={label} hint={hint}>
      {children}
    </DashboardField>
  );
}

export default function SettingsPage() {
  const features = useDashboardSettingsStore((state) => state.features);
  const setFeatureEnabled = useDashboardSettingsStore(
    (state) => state.setFeatureEnabled,
  );
  const profile = useDashboardSettingsStore((state) => state.profile);
  const updateProfile = useDashboardSettingsStore(
    (state) => state.updateProfile,
  );
  const taxes = useDashboardSettingsStore((state) => state.taxes);
  const updateTaxes = useDashboardSettingsStore((state) => state.updateTaxes);
  const pdfTemplate = useDashboardSettingsStore((state) => state.pdfTemplate);
  const setPdfTemplate = useDashboardSettingsStore(
    (state) => state.setPdfTemplate,
  );

  const [tab, setTab] = useState("general");
  const [_secretVisible, _setSecretVisible] = useState(false);
  const [_copied, setCopied] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile);
  const [vatEnabled, setVatEnabled] = useState(taxes.vatEnabled);
  const [vatRate, setVatRate] = useState(String(taxes.vatRate));
  const [serviceCharge, setServiceCharge] = useState(
    taxes.serviceChargeEnabled,
  );
  const [serviceRate, setServiceRate] = useState(
    String(taxes.serviceChargeRate),
  );
  const [origin, setOrigin] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const [hours, setHours] = useState(
    DAYS.reduce(
      (acc, d) => {
        acc[d] = { open: d !== "Sun", from: "09:00", to: "22:00" };
        return acc;
      },
      {} as Record<string, { open: boolean; from: string; to: string }>,
    ),
  );

  const [notifs, setNotifs] = useState({
    whatsapp: true,
    newOrder: true,
    lowStock: false,
    dailyReport: true,
  });

  const _handleCopyWebhook = () => {
    navigator.clipboard.writeText(
      "https://moji.app/api/webhooks/paystack/rest-001",
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    dashboardToast("Webhook URL copied");
  };

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1200px] mx-auto w-full">
      <DashboardPageHeader
        title="Settings"
        description="Configure the restaurant, enabled modules, payments, and connected experiences."
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab nav */}
        <aside className="lg:w-52 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scrollbar-none pb-1 lg:pb-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors text-left",
                  tab === id
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-100",
                )}
              >
                <Icon size={16} weight={tab === id ? "fill" : "regular"} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 max-w-2xl space-y-4">
          {/* ── FEATURES (Commented out for now) ── */}
          {/* {tab === "features" && (
            <>
              <SectionCard title="Restaurant modules">
                <p className="text-sm text-gray-500">
                  Keep the dashboard lightweight by enabling only the tools this
                  restaurant actually uses. Menu stays on as the core product
                  surface.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(
                    [
                      "menu",
                      "orders",
                      "tables",
                      "payments",
                      "loyalty",
                      "analytics",
                      "staff",
                      "notifications",
                      "integrations",
                    ] as DashboardFeature[]
                  ).map((feature) => {
                    const locked = feature === "menu";
                    return (
                      <div
                        key={feature}
                        className={cn(
                          "flex items-center justify-between rounded-xl border p-3",
                          features[feature]
                            ? "border-gray-200 bg-white"
                            : "border-gray-100 bg-gray-50",
                        )}
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {FEATURE_LABELS[feature]}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {locked
                              ? "Core menu module"
                              : features[feature]
                                ? "Enabled"
                                : "Hidden until enabled"}
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={features[feature]}
                          onChange={() => {
                            setFeatureEnabled(feature, !features[feature]);
                            dashboardToast(
                              locked
                                ? "Menu is the core module"
                                : `${FEATURE_LABELS[feature]} ${features[feature] ? "disabled" : "enabled"}`,
                              locked ? "info" : "success",
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard title="Connected behaviour">
                <div className="space-y-3 text-sm text-gray-500">
                  <p>
                    Disabled modules show setup prompts instead of broken
                    routes.
                  </p>
                  <p>
                    Payment, tax, and loyalty settings are reflected in mocked
                    dashboard flows as they are configured.
                  </p>
                  <p>
                    Restaurant profile edits are held in local dashboard state
                    for this demo pass.
                  </p>
                </div>
              </SectionCard>
            </>
          )} */}

          {/* ── GENERAL ── */}
          {tab === "general" && (
            <>
              <SectionCard title="Restaurant profile">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field id="restaurant-name" label="Restaurant name">
                    <DashboardInput
                      id="restaurant-name"
                      type="text"
                      value={profileDraft.name}
                      onChange={(event) =>
                        setProfileDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field
                    id="url-slug"
                    label="URL slug"
                    hint="moji.app/your-slug"
                  >
                    <div className="relative">
                      <Globe
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={15}
                      />
                      <DashboardInput
                        id="url-slug"
                        type="text"
                        value={profileDraft.slug}
                        onChange={(event) =>
                          setProfileDraft((current) => ({
                            ...current,
                            slug: event.target.value,
                          }))
                        }
                        className="pl-9"
                      />
                    </div>
                  </Field>
                  <Field id="phone-number" label="Phone number">
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={15}
                      />
                      <DashboardInput
                        id="phone-number"
                        type="text"
                        value={profileDraft.phone}
                        onChange={(event) =>
                          setProfileDraft((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        className="pl-9"
                      />
                    </div>
                  </Field>
                  <Field id="email-address" label="Email Address">
                    <DashboardInput
                      id="email-address"
                      type="email"
                      value={profileDraft.email || ""}
                      disabled
                      readOnly
                    />
                  </Field>
                  <Field id="city" label="City">
                    <DashboardInput
                      id="city"
                      type="text"
                      value={profileDraft.city}
                      onChange={(event) =>
                        setProfileDraft((current) => ({
                          ...current,
                          city: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field id="currency" label="Currency">
                    <DashboardSelect
                      id="currency"
                      value={profileDraft.currency || "NGN"}
                      onChange={(event) =>
                        setProfileDraft((current) => ({
                          ...current,
                          currency: event.target.value,
                        }))
                      }
                    >
                      <option value="NGN">NGN (₦)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GHS">GHS (₵)</option>
                      <option value="KES">KES (KSh)</option>
                    </DashboardSelect>
                  </Field>
                </div>
                <Field id="street-address" label="Street Address">
                  <DashboardInput
                    id="street-address"
                    type="text"
                    value={profileDraft.address || ""}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field id="description" label="Description">
                  <DashboardTextarea
                    id="description"
                    rows={3}
                    value={profileDraft.description}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </Field>
              </SectionCard>

              <SectionCard title="Brand assets">
                <p className="text-sm text-gray-500 mb-2">
                  Customize the visual identity of your restaurant diner menu.
                  These assets are displayed directly on the mobile ordering
                  page.
                </p>

                {/* Logo Section */}
                <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {profileDraft.logoUrl ? (
                      <img
                        src={profileDraft.logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-400">
                        No Logo
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-gray-900">
                      Restaurant Logo
                    </p>
                    <p className="text-xs text-gray-400">
                      Square image, recommended 256x256px.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("logo-upload-input")?.click()
                        }
                        className="text-xs font-semibold px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-700 cursor-pointer transition-colors"
                      >
                        Upload Image
                      </button>
                      {profileDraft.logoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setProfileDraft((curr) => ({
                              ...curr,
                              logoUrl: "",
                            }))
                          }
                          className="text-xs font-semibold px-3 py-1.5 bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 rounded-lg text-gray-700 cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                      <input
                        type="file"
                        id="logo-upload-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileDraft((curr) => ({
                                ...curr,
                                logoUrl: reader.result as string,
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image Banner Section */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Menu Header Cover
                  </p>

                  {/* Visual Preview mirroring Diner experience */}
                  <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100 flex items-end">
                    {profileDraft.coverImageUrl &&
                    !profileDraft.coverImageUrl.startsWith("gradient:") ? (
                      <img
                        src={profileDraft.coverImageUrl}
                        alt="Cover Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          background: profileDraft.coverImageUrl?.startsWith(
                            "gradient:",
                          )
                            ? profileDraft.coverImageUrl.slice(9)
                            : "linear-gradient(135deg,#fff7ed_0%,#fef3c7_45%,#f3f4f6_100%)",
                        }}
                      />
                    )}

                    {/* Simulated restaurant title and logo overlay inside preview to match exactly */}
                    <div className="absolute left-4 bottom-4 z-10 flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border-2 border-white rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
                        {profileDraft.logoUrl ? (
                          <img
                            src={profileDraft.logoUrl}
                            alt="Logo overlay"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-black text-gray-400">
                            {profileDraft.name?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold text-sm bg-black/35 px-2 py-0.5 rounded-md">
                        {profileDraft.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div className="space-y-1.5">
                      <p className="text-xs text-gray-400">
                        Custom banner upload or choose gradient below.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("cover-upload-input")
                              ?.click()
                          }
                          className="text-xs font-semibold px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-700 cursor-pointer transition-colors"
                        >
                          Upload Custom Cover
                        </button>
                        {profileDraft.coverImageUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setProfileDraft((curr) => ({
                                ...curr,
                                coverImageUrl: "",
                              }))
                            }
                            className="text-xs font-semibold px-3 py-1.5 bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 rounded-lg text-gray-700 cursor-pointer transition-colors"
                          >
                            Reset
                          </button>
                        )}
                        <input
                          type="file"
                          id="cover-upload-input"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProfileDraft((curr) => ({
                                  ...curr,
                                  coverImageUrl: reader.result as string,
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gradient Swatches */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-700">
                      Preset Pastel Gradient Backgrounds
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        {
                          name: "Sunset Peach",
                          gradient:
                            "gradient:linear-gradient(135deg, #ffedd5 0%, #fee2e2 50%, #fef3c7 100%)",
                        },
                        {
                          name: "Ocean Breeze",
                          gradient:
                            "gradient:linear-gradient(135deg, #e0f2fe 0%, #e0e7ff 60%, #fae8ff 100%)",
                        },
                        {
                          name: "Fresh Mint",
                          gradient:
                            "gradient:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #fef9c3 100%)",
                        },
                        {
                          name: "Sweet Lavender",
                          gradient:
                            "gradient:linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e0f2fe 100%)",
                        },
                        {
                          name: "Warm Sand",
                          gradient:
                            "gradient:linear-gradient(135deg, #fefaf0 0%, #f5ebe0 60%, #e3d5ca 100%)",
                        },
                      ].map((preset) => {
                        const isSelected =
                          profileDraft.coverImageUrl === preset.gradient;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            title={preset.name}
                            onClick={() =>
                              setProfileDraft((curr) => ({
                                ...curr,
                                coverImageUrl: preset.gradient,
                              }))
                            }
                            className={cn(
                              "w-10 h-10 rounded-full border shadow-sm shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all relative flex items-center justify-center",
                              isSelected
                                ? "border-gray-900 ring-2 ring-gray-900/10"
                                : "border-gray-200",
                            )}
                            style={{ background: preset.gradient.slice(9) }}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Social links">
                <Field id="social-instagram" label="Instagram">
                  <div className="relative">
                    <InstagramLogo
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={15}
                    />
                    <DashboardInput
                      id="social-instagram"
                      type="text"
                      placeholder="@yourhandle"
                      className="pl-9"
                    />
                  </div>
                </Field>
                <Field id="social-twitter" label="Twitter / X">
                  <div className="relative">
                    <TwitterLogo
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={15}
                    />
                    <DashboardInput
                      id="social-twitter"
                      type="text"
                      placeholder="@yourhandle"
                      className="pl-9"
                    />
                  </div>
                </Field>
              </SectionCard>

              <SectionCard title="Ordering">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Accepting orders
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Diners can scan QR codes and place orders
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={profileDraft.acceptingOrders}
                    onChange={() =>
                      setProfileDraft((current) => ({
                        ...current,
                        acceptingOrders: !current.acceptingOrders,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Loyalty programme
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Award points on every paid order
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={features.loyalty}
                    onChange={() =>
                      setFeatureEnabled("loyalty", !features.loyalty)
                    }
                  />
                </div>
              </SectionCard>

              <div className="flex justify-end">
                <SaveButton onSave={() => updateProfile(profileDraft)} />
              </div>
            </>
          )}

          {/* ── HOURS ── */}
          {tab === "hours" && (
            <>
              <SectionCard title="Opening hours">
                <div className="space-y-3">
                  {DAYS.map((day) => (
                    <div key={day} className="flex items-center gap-3">
                      <div className="w-10 text-sm font-semibold text-gray-500">
                        {day}
                      </div>
                      <ToggleSwitch
                        checked={hours[day].open}
                        onChange={() =>
                          setHours((h) => ({
                            ...h,
                            [day]: { ...h[day], open: !h[day].open },
                          }))
                        }
                      />
                      {hours[day].open ? (
                        <div className="flex items-center gap-2 flex-1">
                          <DashboardInput
                            type="time"
                            value={hours[day].from}
                            onChange={(e) =>
                              setHours((h) => ({
                                ...h,
                                [day]: { ...h[day], from: e.target.value },
                              }))
                            }
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-400 shrink-0">
                            to
                          </span>
                          <DashboardInput
                            type="time"
                            value={hours[day].to}
                            onChange={(e) =>
                              setHours((h) => ({
                                ...h,
                                [day]: { ...h[day], to: e.target.value },
                              }))
                            }
                            className="flex-1"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 ml-1">
                          Closed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
              <div className="flex justify-end">
                <SaveButton label="Save hours" />
              </div>
            </>
          )}
          {/* ── MENU QR & PDF TEMPLATE ── */}
          {tab === "qr" && (
            <>
              <SectionCard title="Menu QR Code">
                <p className="text-sm text-gray-500">
                  This is the single primary QR code for your restaurant menu.
                  Diners scan this QR code to view your digital menu and place
                  self-reported cash/transfer orders.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="p-4 bg-white rounded-2xl border border-gray-200">
                    <QRCode
                      id="restaurant-qr-code-svg"
                      value={`${origin}/${profileDraft.slug}`}
                      size={160}
                    />
                  </div>
                  <div className="flex-1 space-y-3 w-full text-center sm:text-left">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Primary QR Code Link
                      </p>
                      <p className="text-xs font-mono text-gray-500 mt-1 select-all break-all underline">
                        {`${origin}/${profileDraft.slug}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const svg = document.getElementById(
                            "restaurant-qr-code-svg",
                          );
                          if (!svg) return;
                          const svgData = new XMLSerializer().serializeToString(
                            svg,
                          );
                          const svgBlob = new Blob([svgData], {
                            type: "image/svg+xml;charset=utf-8",
                          });
                          const svgUrl = URL.createObjectURL(svgBlob);
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement("canvas");
                            canvas.width = 512;
                            canvas.height = 512;
                            const ctx = canvas.getContext("2d");
                            if (ctx) {
                              ctx.fillStyle = "#ffffff";
                              ctx.fillRect(0, 0, canvas.width, canvas.height);
                              ctx.drawImage(
                                img,
                                0,
                                0,
                                canvas.width,
                                canvas.height,
                              );
                              const pngUrl = canvas.toDataURL("image/png");
                              const downloadLink = document.createElement("a");
                              downloadLink.href = pngUrl;
                              downloadLink.download = `${profileDraft.slug}-menu-qr.png`;
                              document.body.appendChild(downloadLink);
                              downloadLink.click();
                              document.body.removeChild(downloadLink);
                              dashboardToast("QR code downloaded as PNG");
                            }
                            URL.revokeObjectURL(svgUrl);
                          };
                          img.src = svgUrl;
                        }}
                        className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors"
                      >
                        Download PNG
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${origin}/${profileDraft.slug}`,
                          );
                          dashboardToast("Link copied to clipboard");
                        }}
                        className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-colors"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Menu PDF Style Template">
                <p className="text-sm text-gray-500">
                  Select the template style used when you generate and export
                  your menu PDF.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      id: "classic",
                      title: "Classic & Standard Layout",
                      description:
                        "Classical columns with clear typography. Best for traditional menus.",
                    },
                    {
                      id: "modern",
                      title: "Modern Minimalist",
                      description:
                        "Bold headers with spacious, clean layouts. Best for cafes and grills.",
                    },
                    {
                      id: "elegant",
                      title: "Elegant Lounge",
                      description:
                        "Premium centered text with decorative divider rules. Best for fine dining.",
                    },
                  ].map((tmpl) => {
                    const isSelected = pdfTemplate === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setPdfTemplate(
                            tmpl.id as "classic" | "modern" | "elegant",
                          );
                          dashboardToast(`PDF layout updated to ${tmpl.title}`);
                        }}
                        className={cn(
                          "text-left flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                          isSelected
                            ? "border-gray-900 bg-gray-50 font-semibold text-gray-900"
                            : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50 text-gray-500",
                        )}
                      >
                        <div className="mt-0.5 flex-none">
                          {isSelected ? (
                            <div className="h-4 w-4 rounded-full bg-gray-900 flex items-center justify-center text-white">
                              <CheckCircle size={12} weight="bold" />
                            </div>
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-gray-300 bg-white font-normal"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {tmpl.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed font-normal">
                            {tmpl.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            </>
          )}

          {/* ── TAX & VAT ── */}
          {tab === "taxes" && (
            <>
              <SectionCard title="VAT">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Charge VAT
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Added automatically to every order total
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={vatEnabled}
                    onChange={() => setVatEnabled((v) => !v)}
                  />
                </div>
                {vatEnabled && (
                  <Field
                    id="vat-rate"
                    label="VAT rate (%)"
                    hint="Standard Nigerian VAT is 7.5%"
                  >
                    <div className="relative max-w-[140px]">
                      <DashboardInput
                        id="vat-rate"
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={vatRate}
                        onChange={(e) => setVatRate(e.target.value)}
                        className="pr-8"
                      />
                      <Percent
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={14}
                      />
                    </div>
                  </Field>
                )}
              </SectionCard>

              <SectionCard title="Service charge">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Add service charge
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Optional fee added to the bill before payment
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={serviceCharge}
                    onChange={() => setServiceCharge((v) => !v)}
                  />
                </div>
                {serviceCharge && (
                  <Field
                    id="service-charge-rate"
                    label="Service charge rate (%)"
                  >
                    <div className="relative max-w-[140px]">
                      <DashboardInput
                        id="service-charge-rate"
                        type="number"
                        min={0}
                        max={30}
                        step={0.5}
                        value={serviceRate}
                        onChange={(e) => setServiceRate(e.target.value)}
                        className="pr-8"
                      />
                      <Percent
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={14}
                      />
                    </div>
                  </Field>
                )}
              </SectionCard>

              <div className="flex justify-end">
                <SaveButton
                  label="Save tax settings"
                  onSave={() =>
                    updateTaxes({
                      vatEnabled,
                      vatRate: Number(vatRate) || 0,
                      serviceChargeEnabled: serviceCharge,
                      serviceChargeRate: Number(serviceRate) || 0,
                    })
                  }
                />
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === "notifications" && (
            <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100">
              {(
                [
                  {
                    key: "whatsapp",
                    label: "WhatsApp receipts",
                    sub: "Send order receipt via WhatsApp after payment",
                    Icon: WhatsappLogo,
                  },
                  {
                    key: "newOrder",
                    label: "New order alerts",
                    sub: "Sound + push notification on each new order",
                    Icon: Bell,
                  },
                  {
                    key: "lowStock",
                    label: "Low stock alerts",
                    sub: "Notify when an item has fewer than 5 portions",
                    Icon: Bell,
                  },
                  {
                    key: "dailyReport",
                    label: "Daily summary report",
                    sub: "EOD report with revenue, orders and top dishes",
                    Icon: Bell,
                  },
                ] as const
              ).map(({ key, label, sub, Icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                      <Icon size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={notifs[key]}
                    onChange={() =>
                      setNotifs((n) => ({ ...n, [key]: !n[key] }))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── SECURITY ── */}
          {tab === "security" && (
            <SectionCard title="Change Password">
              <p className="text-sm text-gray-500">
                Update your admin login password. You will be logged out of all
                other active sessions.
              </p>
              <Field id="current-password" label="Current Password">
                <div className="relative">
                  <Key
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={15}
                  />
                  <DashboardInput
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    autoComplete="current-password"
                  />
                </div>
              </Field>
              <Field id="new-password" label="New Password">
                <div className="relative">
                  <Key
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={15}
                  />
                  <DashboardInput
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    autoComplete="new-password"
                  />
                </div>
              </Field>
              <Field id="confirm-password" label="Confirm New Password">
                <div className="relative">
                  <Key
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={15}
                  />
                  <DashboardInput
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    autoComplete="new-password"
                  />
                </div>
              </Field>
              <div className="flex justify-end pt-1">
                <SaveButton label="Update Password" />
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
