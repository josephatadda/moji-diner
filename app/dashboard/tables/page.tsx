"use client";

import {
  Copy,
  DeviceMobile,
  DownloadSimple,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import {
  DashboardButton,
  DashboardConfirmDialog,
  DashboardEmptyState,
  DashboardField,
  DashboardInput,
  DashboardModal,
  DashboardPageHeader,
  DashboardSelect,
  DashboardSetupPrompt,
  DashboardStatusBadge,
  DashboardTable,
  dashboardToast,
  ds,
  statusLabel,
  t,
} from "@/components/dashboard/ui";
import {
  MOCK_RESTAURANT,
  MOCK_TABLES,
  type RestaurantTable,
} from "@/lib/mockData";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";

type TableFormMode = "add" | "edit";

const statusTone: Record<
  RestaurantTable["status"],
  "green" | "orange" | "blue"
> = {
  available: "green",
  occupied: "orange",
  awaiting_payment: "blue",
};

function tableUrl(tableNumber: number) {
  return `http://localhost:3000/${MOCK_RESTAURANT.slug}/t/${tableNumber}`;
}

function TableForm({
  mode,
  initialTable,
  onCancel,
  onSubmit,
}: {
  mode: TableFormMode;
  initialTable?: RestaurantTable | null;
  onCancel: () => void;
  onSubmit: (table: Omit<RestaurantTable, "id" | "restaurantId">) => void;
}) {
  const [label, setLabel] = useState(initialTable?.label ?? "");
  const [tableNumber, setTableNumber] = useState(
    String(initialTable?.tableNumber ?? ""),
  );
  const [capacity, setCapacity] = useState(
    String(initialTable?.capacity ?? ""),
  );
  const [status, setStatus] = useState<RestaurantTable["status"]>(
    initialTable?.status ?? "available",
  );

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const numericTable = Number(tableNumber);
        const numericCapacity = Number(capacity);
        if (!label.trim() || !numericTable || !numericCapacity) {
          dashboardToast("Complete the table details", "error");
          return;
        }
        onSubmit({
          label: label.trim(),
          tableNumber: numericTable,
          capacity: numericCapacity,
          status,
        });
      }}
    >
      <DashboardField id={`${mode}-table-label`} label="Table name">
        <DashboardInput
          id={`${mode}-table-label`}
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="e.g. Patio Table 4"
        />
      </DashboardField>
      <div className={ds.form.grid2}>
        <DashboardField id={`${mode}-table-number`} label="Table number">
          <DashboardInput
            id={`${mode}-table-number`}
            value={tableNumber}
            onChange={(event) => setTableNumber(event.target.value)}
            inputMode="numeric"
            placeholder="e.g. 4"
          />
        </DashboardField>
        <DashboardField id={`${mode}-table-capacity`} label="Capacity">
          <DashboardInput
            id={`${mode}-table-capacity`}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            inputMode="numeric"
            placeholder="e.g. 6"
          />
        </DashboardField>
      </div>
      <DashboardField id={`${mode}-table-status`} label="Status">
        <DashboardSelect
          id={`${mode}-table-status`}
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as RestaurantTable["status"])
          }
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="awaiting_payment">Awaiting payment</option>
        </DashboardSelect>
      </DashboardField>
      <div className="flex justify-end gap-2">
        <DashboardButton variant="ghost" onClick={onCancel}>
          Cancel
        </DashboardButton>
        <DashboardButton type="submit">
          {mode === "add" ? "Create table" : "Save changes"}
        </DashboardButton>
      </div>
    </form>
  );
}

export default function TablesPage() {
  const tablesEnabled = useDashboardSettingsStore(
    (state) => state.features.tables,
  );
  const [tables, setTables] = useState<RestaurantTable[]>(MOCK_TABLES);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(
    null,
  );
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(
    null,
  );
  const [deletingTable, setDeletingTable] = useState<RestaurantTable | null>(
    null,
  );
  const [isAddingTable, setIsAddingTable] = useState(false);

  const summary = useMemo(
    () => ({
      total: tables.length,
      occupied: tables.filter((table) => table.status === "occupied").length,
      awaiting: tables.filter((table) => table.status === "awaiting_payment")
        .length,
    }),
    [tables],
  );

  const copyTableLink = async (table: RestaurantTable) => {
    try {
      await navigator.clipboard.writeText(tableUrl(table.tableNumber));
      dashboardToast(`${table.label} link copied`);
    } catch {
      dashboardToast("Could not copy table link", "error");
    }
  };

  if (!tablesEnabled) {
    return (
      <DashboardSetupPrompt
        title="Table ordering is off"
        description="Enable tables and QR codes when this restaurant wants dine-in guests to order from assigned tables."
        featureLabel="tables"
        icon={DeviceMobile}
      />
    );
  }

  return (
    <div className={ds.page}>
      <DashboardPageHeader
        title="Tables & QR Codes"
        description="Manage the dining floor, table links, and diner QR codes."
        actions={
          <>
            <DashboardButton
              variant="ghost"
              onClick={() =>
                dashboardToast(
                  "Bulk PDF download is mocked in this preview",
                  "info",
                )
              }
            >
              <DownloadSimple size={16} />
              Download all
            </DashboardButton>
            <DashboardButton onClick={() => setIsAddingTable(true)}>
              <Plus size={16} weight="bold" />
              Add table
            </DashboardButton>
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className={ds.metric.card}>
          <p className={ds.metric.label}>Total tables</p>
          <p className={ds.metric.value}>{summary.total}</p>
          <p className={ds.metric.sub}>Configured for QR ordering</p>
        </div>
        <div className={ds.metric.card}>
          <p className={ds.metric.label}>Occupied</p>
          <p className={ds.metric.value}>{summary.occupied}</p>
          <p className={ds.metric.sub}>Currently seated</p>
        </div>
        <div className={ds.metric.card}>
          <p className={ds.metric.label}>Awaiting bill</p>
          <p className={ds.metric.value}>{summary.awaiting}</p>
          <p className={ds.metric.sub}>Needs payment follow-up</p>
        </div>
      </div>

      <DashboardTable
        rows={tables}
        getRowKey={(table) => table.id}
        empty={
          <DashboardEmptyState
            title="No tables yet"
            description="Create your first table to generate diner QR links."
            icon={DeviceMobile}
          />
        }
        columns={[
          {
            key: "table",
            header: "Table",
            render: (table) => (
              <div>
                <p className={t.bodyStrong}>{table.label}</p>
                <p className={t.meta}>Table {table.tableNumber}</p>
              </div>
            ),
          },
          {
            key: "capacity",
            header: "Capacity",
            className: "text-gray-600",
            render: (table) => `${table.capacity} seats`,
          },
          {
            key: "status",
            header: "Status",
            render: (table) => (
              <DashboardStatusBadge tone={statusTone[table.status]}>
                {statusLabel.table[table.status]}
              </DashboardStatusBadge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            className: "text-right",
            render: (table) => (
              <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                <DashboardButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTable(table)}
                >
                  View QR
                </DashboardButton>
                <DashboardButton
                  variant="icon"
                  size="sm"
                  onClick={() => copyTableLink(table)}
                  aria-label={`Copy ${table.label} link`}
                >
                  <Copy size={15} />
                </DashboardButton>
                <DashboardButton
                  variant="icon"
                  size="sm"
                  onClick={() => setEditingTable(table)}
                  aria-label={`Edit ${table.label}`}
                >
                  <PencilSimple size={15} />
                </DashboardButton>
                <DashboardButton
                  variant="icon"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => setDeletingTable(table)}
                  aria-label={`Delete ${table.label}`}
                >
                  <Trash size={15} />
                </DashboardButton>
              </div>
            ),
          },
        ]}
      />

      <DashboardModal
        open={!!selectedTable}
        onOpenChange={(open) => !open && setSelectedTable(null)}
        title={selectedTable?.label || ""}
        description={
          selectedTable
            ? `Diners scan this code to order from table ${selectedTable.tableNumber}.`
            : undefined
        }
        maxWidth="sm"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <DashboardButton
              variant="ghost"
              fullWidth
              onClick={() => selectedTable && copyTableLink(selectedTable)}
            >
              <Copy size={16} />
              Copy link
            </DashboardButton>
            <DashboardButton
              fullWidth
              onClick={() =>
                dashboardToast("PNG download is mocked in this preview", "info")
              }
            >
              <DownloadSimple size={16} />
              Download
            </DashboardButton>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="rounded-xl bg-white p-4">
              {selectedTable && (
                <QRCode
                  value={tableUrl(selectedTable.tableNumber)}
                  size={196}
                />
              )}
            </div>
          </div>
          {selectedTable && (
            <div className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
              <p className={t.bodyStrong}>
                {tableUrl(selectedTable.tableNumber)}
              </p>
              <p className={t.meta}>Local preview link</p>
            </div>
          )}
        </div>
      </DashboardModal>

      <DashboardModal
        open={isAddingTable}
        onOpenChange={setIsAddingTable}
        title="Add table"
        description="Create a diner-facing table and QR link."
      >
        <TableForm
          mode="add"
          onCancel={() => setIsAddingTable(false)}
          onSubmit={(table) => {
            setTables((current) => [
              ...current,
              {
                ...table,
                id: `tbl-${Date.now()}`,
                restaurantId: MOCK_RESTAURANT.id,
              },
            ]);
            setIsAddingTable(false);
            dashboardToast("Table added");
          }}
        />
      </DashboardModal>

      <DashboardModal
        open={!!editingTable}
        onOpenChange={(open) => !open && setEditingTable(null)}
        title="Edit table"
        description="Update table details and QR ordering status."
      >
        <TableForm
          mode="edit"
          initialTable={editingTable}
          onCancel={() => setEditingTable(null)}
          onSubmit={(table) => {
            setTables((current) =>
              current.map((item) =>
                item.id === editingTable?.id ? { ...item, ...table } : item,
              ),
            );
            setEditingTable(null);
            dashboardToast("Table updated");
          }}
        />
      </DashboardModal>

      <DashboardConfirmDialog
        open={!!deletingTable}
        onOpenChange={(open) => !open && setDeletingTable(null)}
        title="Delete table?"
        description={
          deletingTable
            ? `${deletingTable.label} and its QR link will be removed from this local preview.`
            : "This table will be removed."
        }
        confirmLabel="Delete table"
        destructive
        onConfirm={() => {
          setTables((current) =>
            current.filter((table) => table.id !== deletingTable?.id),
          );
          setDeletingTable(null);
          dashboardToast("Table deleted");
        }}
      />
    </div>
  );
}
