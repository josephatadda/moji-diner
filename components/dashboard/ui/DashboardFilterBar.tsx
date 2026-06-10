"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import type * as React from "react";
import { ds } from "@/components/dashboard/ui/dashboard-tokens";
import { DashboardSelect } from "./DashboardField";

type DashboardFilterBarProps<T extends string> = {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: readonly T[];
  activeFilter?: T;
  onFilterChange?: (value: T) => void;
  allLabel?: string;
  actions?: React.ReactNode;
};

export function DashboardFilterBar<T extends string>({
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  filters,
  activeFilter,
  onFilterChange,
  allLabel = "All",
  actions,
}: DashboardFilterBarProps<T>) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input on the Left */}
      <div className="min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
        {onSearchChange && (
          <div className="relative w-full">
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

      {/* Filter Dropdown + Actions on the Right */}
      <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center sm:justify-end">
        {filters && activeFilter && onFilterChange && (
          <div className="w-full sm:w-44 shrink-0">
            <DashboardSelect
              value={activeFilter}
              onChange={(e) => onFilterChange(e.target.value as T)}
              aria-label="Filter options"
            >
              {filters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter === "All" ? allLabel : filter}
                </option>
              ))}
            </DashboardSelect>
          </div>
        )}
        {actions && (
          <div className="flex shrink-0 gap-2 w-full sm:w-auto">{actions}</div>
        )}
      </div>
    </div>
  );
}
