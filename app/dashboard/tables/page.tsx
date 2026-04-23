"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { MOCK_TABLES, MOCK_RESTAURANT } from "@/lib/mockData";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ds, t } from "@/lib/design-tokens";

export default function TablesPage() {
  const [selectedTable, setSelectedTable] = useState<typeof MOCK_TABLES[0] | null>(null);
  const [isAddingTable, setIsAddingTable] = useState(false);

  const pendingCount = MOCK_TABLES.filter(t => t.status === "awaiting_payment").length;
  const occupiedCount = MOCK_TABLES.filter(t => t.status === "occupied").length;

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingTable(false);
    // Real implementation would save to DB here
  };

  return (
    <div className={ds.page}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={t.h1}>Tables &amp; QR Codes</h1>
          <p className={`${t.body} mt-1`}>Manage your dining floor and print QR codes</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className={ds.btn.ghost}>
            ↓ Download All PDF
          </button>
          <button onClick={() => setIsAddingTable(true)} className={ds.btn.primary}>
            + Add Table
          </button>
        </div>
      </div>

      {/* Floor Summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className={ds.metric.card}>
          <span className={ds.metric.value}>{MOCK_TABLES.length}</span>
          <span className={ds.metric.label}>Total Tables</span>
        </div>
        <div className={ds.metric.card}>
          <span className={`${ds.metric.value} text-orange-600`}>{occupiedCount}</span>
          <span className={ds.metric.label}>Occupied</span>
        </div>
        <div className={ds.metric.card}>
          <span className={`${ds.metric.value} text-blue-600`}>{pendingCount}</span>
          <span className={ds.metric.label}>Awaiting Bill</span>
        </div>
      </div>

      {/* Tables List */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">Table</div>
          <div className="col-span-2 text-center">Capacity</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-4 text-right">QR Code</div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {MOCK_TABLES.map(table => {
            const statusConfig = {
              available: { bg: "bg-green-100", text: "text-green-700", label: "Available" },
              occupied: { bg: "bg-orange-100", text: "text-orange-700", label: "Occupied" },
              awaiting_payment: { bg: "bg-blue-100", text: "text-blue-700", label: "Awaiting Payment" },
            }[table.status];

            return (
              <div key={table.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-4 items-start sm:items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-3">
                  <p className="font-bold text-gray-900 leading-none mb-1">{table.label}</p>
                  <p className="text-xs text-gray-400">Table {table.tableNumber}</p>
                </div>
                
                <div className="col-span-2 sm:text-center text-sm text-gray-600">
                  <span className="sm:hidden font-medium mr-1 text-gray-400">Capacity:</span>
                  {table.capacity} <span className="text-xs">seats</span>
                </div>

                <div className="col-span-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="col-span-4 flex w-full justify-start sm:justify-end mt-2 sm:mt-0">
                  <button 
                    onClick={() => setSelectedTable(table)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors border border-transparent hover:border-gray-300"
                  >
                    <span>View QR</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Modal */}
      <ResponsiveDialog
        open={!!selectedTable}
        onOpenChange={(o) => !o && setSelectedTable(null)}
        title={selectedTable?.label || ""}
        description={`Scan to order from ${MOCK_RESTAURANT.name}`}
      >
        <div className="flex flex-col items-center justify-center -mx-4 pb-4">
          <div className="p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm mb-6 mt-4">
            {selectedTable && (
              <QRCode
                value={`http://localhost:3000/${MOCK_RESTAURANT.slug}/t/${selectedTable.tableNumber}`}
                size={200}
              />
            )}
          </div>
          <div className="flex gap-3 w-full max-w-sm px-4">
            <button className="flex-1 py-3 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              Copy Link
            </button>
            <button className="flex-1 py-3 text-sm font-bold bg-gray-900 text-white hover:bg-gray-700 rounded-xl transition-colors">
              Download PNG
            </button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Add Table Modal */}
      <ResponsiveDialog
        open={isAddingTable}
        onOpenChange={setIsAddingTable}
        title="Add New Table"
        description="Create a new table for your restaurant floor."
      >
        <form onSubmit={handleAddTableSubmit} className="space-y-4 px-1 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Table Name/Label</label>
            <input required type="text" placeholder="e.g. VIP Booth 1" className={ds.input.base} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Table Number</label>
            <input required type="number" placeholder="e.g. 12" className={ds.input.base} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Seating Capacity</label>
            <input required type="number" placeholder="e.g. 4" className={ds.input.base} />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddingTable(false)} className={ds.btn.ghost}>Cancel</button>
            <button type="submit" className={ds.btn.primary}>Save Table</button>
          </div>
        </form>
      </ResponsiveDialog>
    </div>
  );
}
