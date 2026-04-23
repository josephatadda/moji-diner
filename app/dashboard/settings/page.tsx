"use client";

import { useState } from "react";
import {
  InstagramLogo, Key, WhatsappLogo, Bell, Storefront, CreditCard,
  Info, Globe, Clock, Percent, Sliders, CheckCircle, Copy, Eye, EyeSlash,
  TwitterLogo, Phone, LockKey,
} from "@phosphor-icons/react";
import { MOCK_RESTAURANT } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general",       label: "General",     icon: Storefront },
  { id: "hours",         label: "Hours",       icon: Clock },
  { id: "payments",      label: "Payments",    icon: CreditCard },
  { id: "taxes",         label: "Tax & VAT",   icon: Percent },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations",  label: "Integrations", icon: Sliders },
  { id: "security",      label: "Security",    icon: LockKey },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "w-11 h-6 rounded-full flex items-center px-1 transition-colors duration-200",
        checked ? "bg-zinc-900 justify-end" : "bg-gray-200 justify-start"
      )}
    >
      <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
    </button>
  );
}

function SaveButton({ label = "Save changes" }: { label?: string }) {
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  return (
    <button
      onClick={handleSave}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]",
        saved
          ? "bg-green-500 text-white"
          : "bg-zinc-900 hover:bg-zinc-700 text-white"
      )}
    >
      {saved && <CheckCircle size={15} weight="bold" />}
      {saved ? "Saved" : label}
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <p className="text-sm font-semibold text-zinc-900">{title}</p>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all";

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [secretVisible, setSecretVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [vatEnabled, setVatEnabled] = useState(MOCK_RESTAURANT.vatEnabled);
  const [vatRate, setVatRate] = useState(String(MOCK_RESTAURANT.vatRate));
  const [serviceCharge, setServiceCharge] = useState(false);
  const [serviceRate, setServiceRate] = useState("5");

  const [hours, setHours] = useState(
    DAYS.reduce((acc, d) => ({
      ...acc,
      [d]: { open: d !== "Sun", from: "09:00", to: "22:00" },
    }), {} as Record<string, { open: boolean; from: string; to: string }>)
  );

  const [notifs, setNotifs] = useState({
    whatsapp:    true,
    newOrder:    true,
    lowStock:    false,
    dailyReport: true,
  });

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText("https://moji.app/api/webhooks/paystack/rest-001");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1200px] mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your restaurant profile and integrations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab nav */}
        <aside className="lg:w-52 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scrollbar-none pb-1 lg:pb-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors text-left",
                  tab === id
                    ? "bg-zinc-900 text-white"
                    : "text-gray-500 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-gray-100"
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

          {/* ── GENERAL ── */}
          {tab === "general" && (
            <>
              <SectionCard title="Restaurant profile">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Restaurant name">
                    <input type="text" defaultValue={MOCK_RESTAURANT.name} className={inputCls} />
                  </Field>
                  <Field label="URL slug" hint="moji.app/your-slug">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="text" defaultValue={MOCK_RESTAURANT.slug} className={`${inputCls} pl-9`} />
                    </div>
                  </Field>
                  <Field label="Phone number">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="text" defaultValue={MOCK_RESTAURANT.phone} className={`${inputCls} pl-9`} />
                    </div>
                  </Field>
                  <Field label="City">
                    <input type="text" defaultValue={MOCK_RESTAURANT.city} className={inputCls} />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea rows={3} defaultValue={MOCK_RESTAURANT.description} className={`${inputCls} resize-none`} />
                </Field>
              </SectionCard>

              <SectionCard title="Social links">
                <Field label="Instagram">
                  <div className="relative">
                    <InstagramLogo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input type="text" placeholder="@yourhandle" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
                <Field label="Twitter / X">
                  <div className="relative">
                    <TwitterLogo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input type="text" placeholder="@yourhandle" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
              </SectionCard>

              <SectionCard title="Ordering">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Accepting orders</p>
                    <p className="text-xs text-gray-400 mt-0.5">Diners can scan QR codes and place orders</p>
                  </div>
                  <ToggleSwitch checked={true} onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Loyalty programme</p>
                    <p className="text-xs text-gray-400 mt-0.5">Award points on every paid order</p>
                  </div>
                  <ToggleSwitch checked={MOCK_RESTAURANT.loyaltyEnabled} onChange={() => {}} />
                </div>
              </SectionCard>

              <div className="flex justify-end">
                <SaveButton />
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
                      <div className="w-10 text-sm font-semibold text-gray-500">{day}</div>
                      <ToggleSwitch
                        checked={hours[day].open}
                        onChange={() => setHours((h) => ({
                          ...h,
                          [day]: { ...h[day], open: !h[day].open },
                        }))}
                      />
                      {hours[day].open ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={hours[day].from}
                            onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], from: e.target.value } }))}
                            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                          />
                          <span className="text-xs text-gray-400 shrink-0">to</span>
                          <input
                            type="time"
                            value={hours[day].to}
                            onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], to: e.target.value } }))}
                            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 ml-1">Closed</span>
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

          {/* ── PAYMENTS ── */}
          {tab === "payments" && (
            <>
              <SectionCard title="Paystack integration">
                <p className="text-sm text-gray-500">
                  Connect Paystack to accept card, bank transfer and USSD payments from diners.
                </p>
                <Field label="Public key">
                  <input type="text" placeholder="pk_live_••••••••••••••••" className={inputCls} />
                </Field>
                <Field label="Secret key">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type={secretVisible ? "text" : "password"}
                      placeholder="sk_live_••••••••••••••••"
                      className={`${inputCls} pl-9 pr-10 font-mono`}
                    />
                    <button
                      onClick={() => setSecretVisible((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {secretVisible ? <EyeSlash size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
                <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <Info size={14} className="text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700">Your secret key is encrypted before storage and never exposed to the browser.</p>
                </div>
              </SectionCard>

              <SectionCard title="Webhook URL">
                <p className="text-sm text-gray-500">Paste this URL into your Paystack dashboard under Webhooks.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2.5 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl text-gray-700 truncate">
                    https://moji.app/api/webhooks/paystack/rest-001
                  </code>
                  <button
                    onClick={handleCopyWebhook}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shrink-0"
                  >
                    {copied ? <CheckCircle size={13} className="text-green-500" /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </SectionCard>

              <div className="flex justify-end">
                <SaveButton label="Update API keys" />
              </div>
            </>
          )}

          {/* ── TAX & VAT ── */}
          {tab === "taxes" && (
            <>
              <SectionCard title="VAT">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Charge VAT</p>
                    <p className="text-xs text-gray-400 mt-0.5">Added automatically to every order total</p>
                  </div>
                  <ToggleSwitch checked={vatEnabled} onChange={() => setVatEnabled((v) => !v)} />
                </div>
                {vatEnabled && (
                  <Field label="VAT rate (%)" hint="Standard Nigerian VAT is 7.5%">
                    <div className="relative max-w-[140px]">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={vatRate}
                        onChange={(e) => setVatRate(e.target.value)}
                        className={`${inputCls} pr-8`}
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    </div>
                  </Field>
                )}
              </SectionCard>

              <SectionCard title="Service charge">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Add service charge</p>
                    <p className="text-xs text-gray-400 mt-0.5">Optional fee added to the bill before payment</p>
                  </div>
                  <ToggleSwitch checked={serviceCharge} onChange={() => setServiceCharge((v) => !v)} />
                </div>
                {serviceCharge && (
                  <Field label="Service charge rate (%)">
                    <div className="relative max-w-[140px]">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        step={0.5}
                        value={serviceRate}
                        onChange={(e) => setServiceRate(e.target.value)}
                        className={`${inputCls} pr-8`}
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    </div>
                  </Field>
                )}
              </SectionCard>

              <div className="flex justify-end">
                <SaveButton label="Save tax settings" />
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === "notifications" && (
            <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100">
              {([
                { key: "whatsapp",    label: "WhatsApp receipts",   sub: "Send order receipt via WhatsApp after payment",    Icon: WhatsappLogo },
                { key: "newOrder",    label: "New order alerts",     sub: "Sound + push notification on each new order",     Icon: Bell },
                { key: "lowStock",    label: "Low stock alerts",     sub: "Notify when an item has fewer than 5 portions",   Icon: Bell },
                { key: "dailyReport", label: "Daily summary report", sub: "EOD report with revenue, orders and top dishes", Icon: Bell },
              ] as const).map(({ key, label, sub, Icon }) => (
                <div key={key} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                      <Icon size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={notifs[key]}
                    onChange={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── INTEGRATIONS ── */}
          {tab === "integrations" && (
            <>
              <SectionCard title="WhatsApp (Twilio)">
                <p className="text-sm text-gray-500">
                  Send order receipts and loyalty updates via WhatsApp Business.
                </p>
                <Field label="Account SID">
                  <input type="text" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className={`${inputCls} font-mono`} />
                </Field>
                <Field label="Auth token">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input type="password" placeholder="••••••••••••••••••••••••••••••••" className={`${inputCls} pl-9 font-mono`} />
                  </div>
                </Field>
                <Field label="WhatsApp sender number" hint="Must be a Twilio-registered WhatsApp number">
                  <div className="relative">
                    <WhatsappLogo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input type="text" placeholder="+14155238886" className={`${inputCls} pl-9 font-mono`} />
                  </div>
                </Field>
                <div className="flex justify-end pt-1">
                  <SaveButton label="Save Twilio config" />
                </div>
              </SectionCard>

              <SectionCard title="Supabase">
                <p className="text-sm text-gray-500">
                  Database and real-time subscriptions. These values are managed via environment variables.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].map((key) => (
                    <div key={key} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-[10px] font-mono text-gray-400 mb-0.5">{key}</p>
                      <p className="text-xs font-semibold text-green-600">✓ Configured</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">To update, edit your <code className="font-mono">.env.local</code> file and redeploy.</p>
                </div>
              </SectionCard>
            </>
          )}
          {/* ── SECURITY ── */}
          {tab === "security" && (
            <>
              <SectionCard title="Change Password">
                <p className="text-sm text-gray-500">
                  Update your admin login password. You will be logged out of all other active sessions.
                </p>
                <Field label="Current Password">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input type="password" placeholder="••••••••" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
                <Field label="New Password">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input type="password" placeholder="••••••••" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
                <Field label="Confirm New Password">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input type="password" placeholder="••••••••" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
                <div className="flex justify-end pt-1">
                  <SaveButton label="Update Password" />
                </div>
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
