"use client";

import { cn } from "@/lib/utils";
import { DINER } from "./diner-tokens";

interface SegmentedTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  return (
    <div className="flex rounded-full border border-gray-100 bg-gray-100 p-1">
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-10 flex-1 rounded-full text-sm font-semibold transition-colors",
            value === opt.value
              ? "bg-white text-gray-900 border border-gray-200"
              : "text-gray-500 hover:text-gray-700",
            DINER.pressable,
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
