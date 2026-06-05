"use client";

import type { Icon } from "@phosphor-icons/react";
import { Gear } from "@phosphor-icons/react";
import Link from "next/link";
import { ds, t } from "@/components/dashboard/ui/dashboard-tokens";

type DashboardSetupPromptProps = {
  title: string;
  description: string;
  featureLabel: string;
  icon?: Icon;
};

export function DashboardSetupPrompt({
  title,
  description,
  featureLabel,
  icon: IconComponent = Gear,
}: DashboardSetupPromptProps) {
  return (
    <div className={`${ds.page} flex min-h-[60vh] items-center justify-center`}>
      <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-600">
          <IconComponent size={24} weight="fill" />
        </div>
        <h1 className={t.h2}>{title}</h1>
        <p className={`${t.body} mx-auto mt-2 max-w-sm`}>{description}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/dashboard/settings" className={ds.btn.primary}>
            Enable {featureLabel}
          </Link>
          <Link href="/dashboard/menu" className={ds.btn.ghost}>
            Continue with menu
          </Link>
        </div>
      </div>
    </div>
  );
}
