"use client";

import type * as React from "react";
import { ds } from "@/components/dashboard/ui/dashboard-tokens";
import { cn } from "@/lib/utils";

type BadgeTone = "green" | "orange" | "blue" | "red" | "gray" | "purple";

type DashboardStatusBadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export function DashboardStatusBadge({
  children,
  tone = "gray",
  className,
}: DashboardStatusBadgeProps) {
  return (
    <span className={cn(ds.badge.base, ds.badge[tone], className)}>
      {children}
    </span>
  );
}
