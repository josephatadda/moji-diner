"use client";

import { cn } from "@/lib/utils";
import type { OrderBatch } from "@/store/cart";
import { BottomSheet } from "./BottomSheet";
import { DINER } from "./diner-tokens";

interface OrderStatusTimelineProps {
  open: boolean;
  onClose: () => void;
  batch: OrderBatch | null;
}

const STATUS_ORDER = ["placed", "preparing", "ready", "served"] as const;
type TimelineStatus = (typeof STATUS_ORDER)[number];

const STEPS: {
  key: TimelineStatus;
  label: string;
  descFn: (batch: OrderBatch) => string;
}[] = [
  {
    key: "placed",
    label: "Order placed",
    descFn: () => "We received your order",
  },
  {
    key: "preparing",
    label: "Being prepared",
    descFn: () => "Kitchen is working on it",
  },
  { key: "ready", label: "Ready", descFn: () => "" },
  { key: "served", label: "Served", descFn: () => "" },
] as const;

function formatTimelineTime(timestamp?: number) {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStepTimestamp(batch: OrderBatch, stepKey: TimelineStatus) {
  return (
    batch.statusTimestamps?.[stepKey] ??
    (stepKey === "placed" ? batch.timestamp : undefined)
  );
}

function getStepState(
  stepKey: string,
  batchStatus: string,
): "done" | "active" | "pending" {
  const stepIdx = STATUS_ORDER.indexOf(
    stepKey as (typeof STATUS_ORDER)[number],
  );
  const currentIdx = STATUS_ORDER.indexOf(
    batchStatus as (typeof STATUS_ORDER)[number],
  );
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export function OrderStatusTimeline({
  open,
  onClose,
  batch,
}: OrderStatusTimelineProps) {
  if (!batch) return null;

  const itemCount = batch.items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
  const batchTotal = batch.items.reduce(
    (sum, i) =>
      sum + (i.lineTotal ?? (i.itemPrice ?? 0) * (i.quantity ?? 1) ?? 0),
    0,
  );
  const timeStr = new Date(batch.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      accessibilityTitle="Order Status"
      header={
        <div className="text-left">
          <h2 className={DINER.operationalTitle}>Order Status</h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-gray-400">
            {itemCount} items · ₦{batchTotal.toLocaleString()} · {timeStr}
          </p>
        </div>
      }
      bodyClassName="px-5 pb-7"
    >
      <div className="relative py-1">
        <div className="absolute left-[6px] top-5 bottom-5 w-px bg-gray-100" />

        <div className="space-y-3">
          {STEPS.map((step) => {
            const state = getStepState(step.key, batch.status);
            const desc = step.descFn(batch);
            const stepTime = formatTimelineTime(
              getStepTimestamp(batch, step.key),
            );
            return (
              <div
                key={step.key}
                data-status-step={step.key}
                className="relative grid min-h-[44px] grid-cols-[14px_1fr] gap-3"
              >
                <div className="relative pt-1.5">
                  <div
                    className={cn(
                      "relative z-10 h-3 w-3 rounded-full ring-[3px] ring-white",
                      state === "done" && "bg-green-500",
                      state === "active" &&
                        step.key === "preparing" &&
                        "bg-orange-400 animate-pulse",
                      state === "active" &&
                        step.key !== "preparing" &&
                        "bg-green-500",
                      state === "pending" && "bg-gray-200",
                    )}
                  />
                </div>

                <div className="pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={cn(
                        "text-sm font-semibold leading-tight",
                        state === "pending" ? "text-gray-300" : "text-gray-900",
                      )}
                    >
                      {step.label}
                    </p>
                    {stepTime && (
                      <time
                        dateTime={new Date(
                          getStepTimestamp(batch, step.key) ?? batch.timestamp,
                        ).toISOString()}
                        className="flex-none text-xs font-medium leading-tight text-gray-400 tabular-nums"
                      >
                        {stepTime}
                      </time>
                    )}
                  </div>
                  {desc && (
                    <p className="mt-1 text-xs leading-relaxed text-gray-400">
                      {desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
