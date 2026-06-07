"use client";

import { CaretDown } from "@phosphor-icons/react";
import type * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type DashboardTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

type DashboardTableProps<T> = {
  rows: T[];
  columns: DashboardTableColumn<T>[];
  getRowKey: (row: T) => string;
  empty?: React.ReactNode;
  className?: string;
};

export function DashboardTable<T>({
  rows,
  columns,
  getRowKey,
  empty,
  className,
}: DashboardTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (rowKey: string) => {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(rowKey)) {
        next.delete(rowKey);
      } else {
        next.add(rowKey);
      }
      return next;
    });
  };

  return (
    <div
      className={cn(
        "bg-transparent md:overflow-hidden md:rounded-2xl md:border md:border-gray-100 md:bg-white",
        className,
      )}
    >
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400",
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="transition-colors hover:bg-gray-50/70"
              >
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-5 py-4 align-middle text-sm text-gray-700",
                      index === 0 && "text-gray-900",
                      column.className,
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const rowKey = getRowKey(row);
          const isExpanded = expandedRows.has(rowKey);
          const [primaryColumn, ...secondaryColumns] = columns;
          const actionColumn = secondaryColumns.find(
            (column) => column.key === "actions" || column.key === "action",
          );
          const detailColumns = secondaryColumns.filter(
            (column) => column !== actionColumn,
          );
          const previewColumns = detailColumns.slice(0, 2);

          return (
            <div
              key={rowKey}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
            >
              <button
                type="button"
                onClick={() => toggleRow(rowKey)}
                className="w-full p-4 text-left transition-colors hover:bg-gray-50"
                aria-expanded={isExpanded}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {primaryColumn.render(row)}
                  </div>
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-500">
                    <CaretDown
                      size={16}
                      className={cn(
                        "transition-transform",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </span>
                </div>
                {previewColumns.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {previewColumns.map((column) => (
                      <div
                        key={column.key}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xs"
                      >
                        <span className="font-medium text-gray-400">
                          {column.header}
                        </span>
                        <span className="min-w-0 truncate font-semibold text-gray-700">
                          {column.render(row)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 p-4 pt-3">
                  {detailColumns.length > 0 && (
                    <div className="grid gap-2">
                      {detailColumns.map((column) => (
                        <div
                          key={column.key}
                          className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-3 py-2.5"
                        >
                          <span className="text-xs font-medium text-gray-400">
                            {column.header}
                          </span>
                          <div className="min-w-0 text-right text-sm font-medium text-gray-900">
                            {column.render(row)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {actionColumn && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="mb-2 text-xs font-medium text-gray-400">
                        Actions
                      </p>
                      <div className="[&_button]:h-9 [&_button]:rounded-xl">
                        {actionColumn.render(row)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {rows.length === 0 && empty}
    </div>
  );
}
