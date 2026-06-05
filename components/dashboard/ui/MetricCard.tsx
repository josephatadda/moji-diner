import type React from "react";
import { cn } from "@/lib/utils";
import { ds } from "./dashboard-tokens";

/**
 * Shared dashboard metric/stat card. Border-first, token-backed (ds.metric.*).
 * Single source for every dashboard stat tile — replaces the former
 * StatCard (overview) and the inline MetricCard copies (analytics, loyalty).
 *
 * Header row renders when `trend` or `icon` is provided:
 *   - `trend`  → up/down badge (green for positive, red for negative)
 *   - `icon`   → icon badge (accent or muted)
 * With neither, the card is a plain label / value / sub stack.
 */
interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  /** e.g. "+8%", "-4 min" — rendered as a trend badge in the header */
  trend?: string;
  /** Override auto-detection (default: positive when trend starts with "+") */
  trendPositive?: boolean;
  /** Icon node rendered in the header badge (mutually exclusive with trend) */
  icon?: React.ReactNode;
  /** Accent (orange) vs muted (gray) icon badge */
  iconAccent?: boolean;
  /** Extra classes on the value (e.g. red for a failed count) */
  valueClassName?: string;
}

export function MetricCard({
  label,
  value,
  sub,
  trend,
  trendPositive,
  icon,
  iconAccent = false,
  valueClassName,
}: MetricCardProps) {
  const hasHeader = Boolean(trend || icon);
  const positive = trendPositive ?? trend?.startsWith("+") ?? false;

  return (
    <div className={ds.metric.card}>
      {hasHeader ? (
        <>
          <div className={ds.metric.header}>
            <p className={ds.metric.label}>{label}</p>
            {trend ? (
              <span className={positive ? ds.metric.up : ds.metric.down}>
                {trend}
              </span>
            ) : (
              <span
                className={
                  iconAccent ? ds.metric.iconAccent : ds.metric.iconMuted
                }
              >
                {icon}
              </span>
            )}
          </div>
          <div>
            <p className={cn(ds.metric.value, valueClassName)}>{value}</p>
            {sub && <p className={ds.metric.sub}>{sub}</p>}
          </div>
        </>
      ) : (
        <>
          <p className={ds.metric.label}>{label}</p>
          <p className={cn(ds.metric.value, valueClassName)}>{value}</p>
          {sub && <p className={ds.metric.sub}>{sub}</p>}
        </>
      )}
    </div>
  );
}
