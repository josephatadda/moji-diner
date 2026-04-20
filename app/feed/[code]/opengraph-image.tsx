import { ImageResponse } from "next/og";
import {
  extractDarkColors,
  getPresetByCode,
  resolvePresetConfig,
} from "@/lib/services/presets";

export const runtime = "nodejs";
export const alt = "dialectcn preset preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RADIUS_PX: Record<string, number> = {
  none: 0,
  small: 4,
  default: 8,
  medium: 10,
  large: 12,
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const preset = await getPresetByCode(code);
  if (!preset) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#fafafa",
          fontSize: 64,
        }}
      >
        dialectcn
      </div>,
      size,
    );
  }

  const config = resolvePresetConfig(preset.code);
  const colors = (await extractDarkColors(preset.code)) ?? {
    primary: "#ededed",
    primaryForeground: "#1a1a1a",
    card: "#141414",
    background: "#0a0a0a",
    foreground: "#f5f5f5",
    muted: "#1f1f1f",
    mutedForeground: "#a1a1a1",
    border: "#262626",
    chart1: "#9ca36b",
    destructive: "#ef4444",
  };
  const r = RADIUS_PX[config?.radius ?? "default"] ?? 8;

  const cardStyle = {
    display: "flex",
    flexDirection: "column" as const,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: r * 2,
    padding: 24,
    width: 540,
    height: 260,
  };

  const subLabel = { color: colors.mutedForeground, fontSize: 14 };
  const pillBase = {
    display: "flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
  };

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: colors.background,
        color: colors.foreground,
        fontFamily: "system-ui, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          width: "100%",
        }}
      >
        {/* Contribution History */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", fontSize: 18, fontWeight: 600 }}>
              Contribution History
            </div>
            <div
              style={{
                ...pillBase,
                background: colors.muted,
                color: colors.mutedForeground,
              }}
            >
              +12% vs last month
            </div>
          </div>
          <div style={{ ...subLabel, marginTop: 4, display: "flex" }}>
            Last 6 months of activity
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 14,
              marginTop: 18,
              height: 90,
            }}
          >
            {[
              { id: "dec", h: 42 },
              { id: "jan", h: 70 },
              { id: "feb", h: 52 },
              { id: "mar", h: 60 },
              { id: "apr", h: 36 },
              { id: "may", h: 88 },
            ].map((bar) => (
              <div
                key={bar.id}
                style={{
                  display: "flex",
                  width: 42,
                  height: bar.h,
                  background: colors.chart1,
                  borderRadius: r,
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: colors.muted,
                borderRadius: r * 1.5,
                padding: "8px 12px",
                flex: 1,
              }}
            >
              <div style={{ display: "flex", ...subLabel, fontSize: 10 }}>
                UPCOMING
              </div>
              <div style={{ display: "flex", fontSize: 14, fontWeight: 600 }}>
                May 25
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: colors.muted,
                borderRadius: r * 1.5,
                padding: "8px 12px",
                flex: 1,
              }}
            >
              <div style={{ display: "flex", ...subLabel, fontSize: 10 }}>
                AUTO-SAVE
              </div>
              <div style={{ display: "flex", fontSize: 14, fontWeight: 600 }}>
                Accelerated
              </div>
            </div>
          </div>
        </div>

        {/* Payout Threshold */}
        <div style={cardStyle}>
          <div style={{ display: "flex", fontSize: 18, fontWeight: 600 }}>
            Payout Threshold
          </div>
          <div style={{ ...subLabel, marginTop: 4, display: "flex" }}>
            Set the minimum balance for payouts.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 18,
            }}
          >
            <div style={{ display: "flex", ...subLabel, fontSize: 13 }}>
              Minimum Payout
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 700,
                color: colors.foreground,
              }}
            >
              $2500.00
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 12,
              height: 6,
              background: colors.muted,
              borderRadius: 999,
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "45%",
                height: 6,
                background: colors.primary,
                borderRadius: 999,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              ...subLabel,
              fontSize: 11,
            }}
          >
            <div style={{ display: "flex" }}>$50 (MIN)</div>
            <div style={{ display: "flex" }}>$10,000 (MAX)</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "auto",
              background: colors.primary,
              color: colors.primaryForeground,
              borderRadius: 999,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Save Threshold
          </div>
        </div>

        {/* Distribute Track */}
        <div
          style={{
            ...cardStyle,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              background: colors.muted,
              borderRadius: r * 1.5,
              fontSize: 28,
              color: colors.foreground,
            }}
          >
            +
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              fontWeight: 600,
              marginTop: 14,
            }}
          >
            Distribute Track
          </div>
          <div
            style={{
              display: "flex",
              ...subLabel,
              marginTop: 6,
              textAlign: "center",
              maxWidth: 360,
            }}
          >
            Upload your first master to start reaching listeners.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16,
              background: colors.primary,
              color: colors.primaryForeground,
              borderRadius: 999,
              padding: "8px 18px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Create Release
          </div>
        </div>

        {/* Claimable Balance */}
        <div style={cardStyle}>
          <div style={{ display: "flex", ...subLabel, fontSize: 14 }}>
            Claimable Balance
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 700,
              marginTop: 2,
            }}
          >
            $0.00
          </div>
          <div
            style={{
              ...pillBase,
              marginTop: 6,
              background: colors.muted,
              color: colors.foreground,
              alignSelf: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 6,
                height: 6,
                borderRadius: 999,
                background: colors.destructive,
                marginRight: 6,
              }}
            />
            Pending Setup
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "auto",
              background: colors.muted,
              borderRadius: r * 1.5,
              padding: "10px 14px",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", ...subLabel, fontSize: 13 }}>
                Net Royalties
              </div>
              <div style={{ display: "flex" }}>$0.00</div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", ...subLabel, fontSize: 13 }}>
                Total Ready
              </div>
              <div style={{ display: "flex", fontWeight: 600 }}>$0.00 USD</div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: 16,
          ...subLabel,
          fontSize: 14,
        }}
      >
        <div style={{ display: "flex", color: colors.foreground }}>
          dialectcn
        </div>
        <div style={{ display: "flex" }}>
          --preset={preset.code.slice(0, 24)}
          {preset.code.length > 24 ? "…" : ""}
        </div>
      </div>
    </div>,
    size,
  );
}
