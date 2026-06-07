"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import type * as React from "react";
import { ds } from "@/components/dashboard/ui/dashboard-tokens";
import { cn } from "@/lib/utils";
import { DashboardButton } from "./DashboardButton";

type DashboardFilterBarProps<T extends string> = {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: readonly T[];
  activeFilter?: T;
  onFilterChange?: (value: T) => void;
  actions?: React.ReactNode;
};

export function DashboardFilterBar<T extends string>({
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  filters,
  activeFilter,
  onFilterChange,
  actions,
}: DashboardFilterBarProps<T>) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {filters && activeFilter && onFilterChange && (
          <div className="inline-flex rounded-xl bg-gray-100 p-1">
            {filters.map((filter) => (
              <DashboardButton
                key={filter}
                variant={activeFilter === filter ? "tabActive" : "tab"}
                onClick={() => onFilterChange(filter)}
                className={cn(
                  activeFilter === filter && "bg-white text-gray-900 shadow-sm",
                )}
              >
                {filter}
              </DashboardButton>
            ))}
          </div>
        )}
        {onSearchChange && (
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <MagnifyingGlass
              size={15}
              className={ds.input.iconLeft}
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder={searchPlaceholder}
              className={ds.input.withIcon}
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
