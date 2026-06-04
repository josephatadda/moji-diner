import type { CartItem } from "@/store/cart";

interface ReceiptImageData {
  restaurantName: string;
  tableNumber: number;
  receiptId: string;
  issuedAt: Date;
  items: CartItem[];
  subtotal: number;
  vat: number;
  vatRate: number;
  vatEnabled: boolean;
  tip: number;
  discount: number;
  total: number;
  paymentMethod: string;
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    size?: number;
    weight?: string;
    color?: string;
    align?: CanvasTextAlign;
  } = {},
) {
  ctx.font = `${options.weight ?? "400"} ${options.size ?? 16}px Arial`;
  ctx.fillStyle = options.color ?? "#111827";
  ctx.textAlign = options.align ?? "left";
  ctx.fillText(text, x, y);
}

export function downloadReceiptImage(data: ReceiptImageData) {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 1100;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;
  ctx.roundRect(80, 60, 560, 980, 28);
  ctx.fill();
  ctx.stroke();

  drawText(ctx, "Moji Receipt", 360, 130, {
    size: 34,
    weight: "700",
    align: "center",
  });
  drawText(ctx, data.restaurantName, 360, 170, {
    size: 18,
    color: "#6b7280",
    align: "center",
  });
  drawText(ctx, "Receipt ID", 120, 245, { size: 14, color: "#9ca3af" });
  drawText(ctx, data.receiptId, 120, 275, { size: 20, weight: "700" });
  drawText(ctx, "Amount", 600, 245, {
    size: 14,
    color: "#9ca3af",
    align: "right",
  });
  drawText(ctx, `₦${Math.round(data.total).toLocaleString()}`, 600, 275, {
    size: 20,
    weight: "700",
    align: "right",
  });
  drawText(ctx, "Date & Time", 120, 335, { size: 14, color: "#9ca3af" });
  drawText(
    ctx,
    `${data.issuedAt.toLocaleDateString()} · ${data.issuedAt.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`,
    120,
    365,
    { size: 18, weight: "700" },
  );
  drawText(ctx, `Table ${data.tableNumber}`, 600, 365, {
    size: 18,
    weight: "700",
    align: "right",
  });

  ctx.setLineDash([10, 10]);
  ctx.strokeStyle = "#d1d5db";
  ctx.beginPath();
  ctx.moveTo(120, 430);
  ctx.lineTo(600, 430);
  ctx.stroke();
  ctx.setLineDash([]);

  let y = 485;
  for (const item of data.items.slice(0, 8)) {
    drawText(ctx, `${item.quantity}× ${item.itemName}`, 120, y, {
      size: 17,
      color: "#374151",
    });
    drawText(ctx, `₦${item.lineTotal.toLocaleString()}`, 600, y, {
      size: 17,
      weight: "700",
      align: "right",
    });
    y += 34;
  }

  y += 28;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(120, y);
  ctx.lineTo(600, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += 48;

  const rows: [string, string, boolean?][] = [
    ["Payment", data.paymentMethod],
    ["Subtotal", `₦${data.subtotal.toLocaleString()}`],
  ];
  if (data.vatEnabled && data.vat > 0) {
    rows.push([
      `VAT (${data.vatRate}%)`,
      `₦${Math.round(data.vat).toLocaleString()}`,
    ]);
  }
  if (data.tip > 0) rows.push(["Tip", `₦${data.tip.toLocaleString()}`]);
  if (data.discount > 0) {
    rows.push(["Points discount", `-₦${data.discount.toLocaleString()}`]);
  }
  rows.push([
    "Total paid",
    `₦${Math.round(data.total).toLocaleString()}`,
    true,
  ]);

  for (const [label, value, emphasis] of rows) {
    drawText(ctx, label, 120, y, {
      size: emphasis ? 20 : 16,
      weight: emphasis ? "700" : "400",
      color: emphasis ? "#111827" : "#6b7280",
    });
    drawText(ctx, value, 600, y, {
      size: emphasis ? 20 : 16,
      weight: "700",
      align: "right",
    });
    y += emphasis ? 42 : 32;
  }

  const link = document.createElement("a");
  link.download = `${data.receiptId}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
