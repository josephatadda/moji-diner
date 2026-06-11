import type { CartItem } from "@/store/cart";
import { DinerInfoRow } from "./DinerInfoRow";
import { DINER } from "./diner-tokens";

const RECEIPT_MARKS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
];

interface DinerReceiptProps {
  items: CartItem[];
  subtotal: number;
  vat: number;
  vatRate: number;
  vatEnabled: boolean;
  tip: number;
  discount?: number;
  total: number;
  tableNumber: number;
  paymentMethod: string;
  restaurantName?: string;
  receiptId?: string;
  issuedAt?: Date;
}

export function DinerReceipt({
  items,
  subtotal,
  vat,
  vatRate,
  vatEnabled,
  tip,
  discount = 0,
  total,
  tableNumber,
  paymentMethod,
  restaurantName = "Moji Restaurant",
  receiptId: providedReceiptId,
  issuedAt: providedIssuedAt,
}: DinerReceiptProps) {
  const issuedAt = providedIssuedAt ?? new Date();
  const receiptId =
    providedReceiptId ?? `MOJI-${issuedAt.getTime().toString().slice(-6)}`;

  return (
    <div className="relative w-full overflow-hidden rounded-[24px] border border-gray-100 bg-white text-left">
      <div className="px-5 py-5">
        <p className={DINER.caption}>{restaurantName}</p>
        <p className="mt-1 text-sm font-bold text-gray-900">
          Table {tableNumber}
        </p>
      </div>

      <div className="border-t border-dashed border-gray-200 px-5 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={DINER.caption}>Receipt ID</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{receiptId}</p>
          </div>
          <div className="text-right">
            <p className={DINER.caption}>Amount</p>
            <p className="mt-1 text-sm font-bold text-gray-900 tabular-nums">
              ₦{Math.round(total).toLocaleString()}
            </p>
          </div>
          <div>
            <p className={DINER.caption}>Date & time</p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {issuedAt.toLocaleDateString([], {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              ·{" "}
              {issuedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className={DINER.caption}>Table</p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {tableNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-dashed border-gray-200 px-5 py-4">
        <DinerInfoRow label="Payment" value={paymentMethod} />
        {items.map((item, index) => (
          <DinerInfoRow
            key={item.cartId || `${item.menuItemId || "item"}-${index}`}
            label={`${item.quantity}× ${item.itemName}`}
            value={`₦${(item.lineTotal ?? (item.itemPrice ?? 0) * (item.quantity ?? 1) ?? 0).toLocaleString()}`}
          />
        ))}
      </div>

      <div className="space-y-2 border-t border-dashed border-gray-200 px-5 py-4">
        <DinerInfoRow
          label="Subtotal"
          value={`₦${subtotal.toLocaleString()}`}
        />
        {vatEnabled && vat > 0 && (
          <DinerInfoRow
            label={`VAT (${vatRate}%)`}
            value={`₦${Math.round(vat).toLocaleString()}`}
          />
        )}
        {tip > 0 && (
          <DinerInfoRow label="Tip" value={`₦${tip.toLocaleString()}`} />
        )}
        {discount > 0 && (
          <DinerInfoRow
            label="Points discount"
            value={`-₦${discount.toLocaleString()}`}
          />
        )}
        <DinerInfoRow
          label="Total paid"
          value={`₦${Math.round(total).toLocaleString()}`}
          emphasis
          className="border-t border-gray-100 pt-3"
        />
      </div>

      <div className="flex justify-center gap-1.5 border-t border-dashed border-gray-200 px-5 py-5">
        {RECEIPT_MARKS.map((mark) => (
          <div key={mark} className="h-9 w-1 rounded-full bg-gray-900" />
        ))}
      </div>
    </div>
  );
}
