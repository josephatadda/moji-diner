"use client";

import {
  CaretUpDown,
  ChartBar,
  Check,
  ClipboardText,
  CurrencyDollar,
  DeviceMobile,
  ForkKnife,
  Gear,
  List,
  SignOut,
  SquaresFour,
  Trophy,
  Users,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MOCK_RESTAURANTS, MOCK_USER } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  type DashboardFeature,
  useDashboardSettingsStore,
} from "@/store/dashboard-settings";

const NAV_MAIN: {
  href: string;
  label: string;
  Icon: React.ElementType;
  feature?: DashboardFeature;
}[] = [
  { href: "/dashboard", label: "Overview", Icon: SquaresFour },
  {
    href: "/dashboard/orders",
    label: "Orders",
    Icon: ClipboardText,
    feature: "orders",
  },
  { href: "/dashboard/menu", label: "Menu", Icon: ForkKnife, feature: "menu" },
  {
    href: "/dashboard/tables",
    label: "Tables",
    Icon: DeviceMobile,
    feature: "tables",
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    Icon: CurrencyDollar,
    feature: "payments",
  },
  {
    href: "/dashboard/loyalty",
    label: "Loyalty",
    Icon: Trophy,
    feature: "loyalty",
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    Icon: ChartBar,
    feature: "analytics",
  },
];

const NAV_OTHER: {
  href: string;
  label: string;
  Icon: React.ElementType;
  feature?: DashboardFeature;
}[] = [
  { href: "/dashboard/staff", label: "Staff", Icon: Users, feature: "staff" },
  { href: "/dashboard/settings", label: "Settings", Icon: Gear },
];

function NavItem({
  href,
  label,
  Icon,
  pathname,
  onClick,
  disabled,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
  pathname: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const isActive =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <Link
      href={disabled ? "/dashboard/settings" : href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg text-sm transition-colors relative",
        disabled
          ? "text-gray-300 hover:bg-gray-50 hover:text-gray-500 font-medium"
          : isActive
            ? "bg-orange-50 text-orange-600 font-semibold"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium",
      )}
    >
      {isActive && !disabled && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-orange-500" />
      )}
      <Icon size={16} weight={isActive ? "fill" : "regular"} />
      {label}
      {disabled && (
        <span className="ml-auto rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-400">
          Off
        </span>
      )}
    </Link>
  );
}

function RestaurantSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(MOCK_RESTAURANTS[0]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
      >
        {/* Restaurant avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">{active.name[0]}</span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-gray-900 truncate leading-none">
            {active.name}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Free Plan</p>
        </div>
        <CaretUpDown size={14} className="text-gray-400 shrink-0" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close restaurant switcher"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 border-b border-gray-50">
              Switch restaurant
            </p>
            {MOCK_RESTAURANTS.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => {
                  setActive(r);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0">
                  <span className="text-white text-[11px] font-bold">
                    {r.name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-none">
                    {r.name}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{r.city}</p>
                </div>
                {r.id === active.id && (
                  <Check
                    size={13}
                    className="text-orange-500 shrink-0"
                    weight="bold"
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Sidebar({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  const features = useDashboardSettingsStore((state) => state.features);

  return (
    <div className="flex flex-col h-full bg-white w-[220px] border-r border-gray-100">
      {/* Restaurant switcher */}
      <div className="px-3 pt-4 pb-3 border-b border-gray-50">
        <RestaurantSwitcher />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-3">
            Main
          </p>
          {NAV_MAIN.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              pathname={pathname}
              onClick={onClose}
              disabled={item.feature ? !features[item.feature] : false}
            />
          ))}
        </div>

        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-3">
            Others
          </p>
          {NAV_OTHER.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              pathname={pathname}
              onClick={onClose}
              disabled={item.feature ? !features[item.feature] : false}
            />
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 px-3 py-3">
        <Link
          href="/login"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {MOCK_USER.initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 group-hover:text-red-600 truncate leading-none transition-colors">
              {MOCK_USER.name}
            </p>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {MOCK_USER.email}
            </p>
          </div>
          <SignOut
            size={14}
            className="text-gray-400 group-hover:text-red-500 shrink-0 transition-colors"
          />
        </Link>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex shrink-0">
        <Sidebar pathname={pathname} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 lg:hidden transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar pathname={pathname} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4 lg:hidden shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-600"
          >
            <List size={20} />
          </button>
          <p className="font-bold text-sm text-zinc-900">Dashboard</p>
          <div className="w-9" />
        </header>
        <div className="flex-1 overflow-y-auto w-full">{children}</div>
      </main>
    </div>
  );
}
