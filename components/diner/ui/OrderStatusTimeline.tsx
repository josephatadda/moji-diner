"use client";

import type { OrderBatch } from "@/store/cart";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface OrderStatusTimelineProps {
  open: boolean;
  onClose: () => void;
  batch: OrderBatch | null;
}

const STEPS = [
  {
    key: "placed",
    label: "Order placed",
    descFn: (batch: OrderBatch) =>
      new Date(batch.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
  { key: "preparing", label: "Being prepared", descFn: () => "Kitchen is working on it" },
  { key: "ready", label: "Ready", descFn: () => "" },
  { key: "served", label: "Served", descFn: () => "" },
] as const;

const STATUS_ORDER = ["placed", "preparing", "ready", "served"] as const;

function getStepState(stepKey: string, batchStatus: string): "done" | "active" | "pending" {
  const stepIdx = STATUS_ORDER.indexOf(stepKey as (typeof STATUS_ORDER)[number]);
  const currentIdx = STATUS_ORDER.indexOf(batchStatus as (typeof STATUS_ORDER)[number]);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export function OrderStatusTimeline({ open, onClose, batch }: OrderStatusTimelineProps) {
  if (!batch) return null;

  const itemCount = batch.items.reduce((sum, i) => sum + i.quantity, 0);
  const batchTotal = batch.items.reduce((sum, i) => sum + i.lineTotal, 0);
  const timeStr = new Date(batch.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent>
        <DrawerHeader className="px-5 pt-6 pb-4 text-left">
          <DrawerTitle className="text-xl font-bold text-gray-900">Order Status</DrawerTitle>
          <DrawerDescription className="text-xs text-gray-400 mt-1">
            {itemCount} items · ₦{batchTotal.toLocaleString()} · {timeStr}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-5 pb-8">
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-100" />

            {STEPS.map((step) => {
              const state = getStepState(step.key, batch.status);
              const desc = step.descFn(batch);
              return (
                <div key={step.key} className="relative flex items-center gap-4">
                  <div
                    className={cn(
                      "absolute -left-[15px] w-5 h-5 border-4 border-white rounded-full",
                      state === "done" && "bg-green-500 shadow-sm",
                      state === "active" && step.key === "preparing" && "bg-orange-500 animate-pulse shadow-sm",
                      state === "active" && step.key !== "preparing" && "bg-green-500 shadow-sm",
                      state === "pending" && "bg-gray-200",
                    )}
                  />
                  <div>
                    <p className={cn(
                      "font-bold text-sm",
                      state === "pending" ? "text-gray-400" : "text-gray-900"
                    )}>
                      {step.label}
                    </p>
                    {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
