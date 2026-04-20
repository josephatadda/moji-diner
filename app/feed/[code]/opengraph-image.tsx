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

const FALLBACK_COLORS = {
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

// Satori's CSS parser in this Next.js build doesn't accept oklch(); convert to hex.
function oklchToHex(input: string, fallback: string): string {
  const m = input.match(
    /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?)?\s*\)$/i,
  );
  if (!m) return input.startsWith("#") ? input : fallback;
  const L = m[1].endsWith("%")
    ? Number.parseFloat(m[1]) / 100
    : Number.parseFloat(m[1]);
  const C = m[2].endsWith("%")
    ? (Number.parseFloat(m[2]) / 100) * 0.4
    : Number.parseFloat(m[2]);
  const hDeg = Number.parseFloat(m[3]);
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const gamma = (v: number) => {
    const vc = Math.max(0, Math.min(1, v));
    return vc <= 0.0031308 ? 12.92 * vc : 1.055 * vc ** (1 / 2.4) - 0.055;
  };
  r = gamma(r);
  g = gamma(g);
  bl = gamma(bl);

  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

function normalizeColors(raw: Record<string, string>): typeof FALLBACK_COLORS {
  const pick = (key: keyof typeof FALLBACK_COLORS) =>
    oklchToHex(raw[key] ?? FALLBACK_COLORS[key], FALLBACK_COLORS[key]);
  return {
    primary: pick("primary"),
    primaryForeground: pick("primaryForeground"),
    card: pick("card"),
    background: pick("background"),
    foreground: pick("foreground"),
    muted: pick("muted"),
    mutedForeground: pick("mutedForeground"),
    border: pick("border"),
    chart1: pick("chart1"),
    destructive: pick("destructive"),
  };
}

function brandedFallback() {
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

export default async function OgImage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  try {
    const { code } = await params;
    const preset = await getPresetByCode(code);
    if (!preset) return brandedFallback();

    const config = resolvePresetConfig(preset.code);
    const rawColors = await extractDarkColors(preset.code);
    const colors = rawColors ? normalizeColors(rawColors) : FALLBACK_COLORS;
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

    const previewCode =
      preset.code.length > 28
        ? `--preset=${preset.code.slice(0, 28)}…`
        : `--preset=${preset.code}`;

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
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontSize: 12,
                  background: colors.muted,
                  color: colors.mutedForeground,
                }}
              >
                +12% vs last month
              </div>
            </div>
            <div
              style={{
                display: "flex",
                color: colors.mutedForeground,
                fontSize: 14,
                marginTop: 4,
              }}
            >
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
                <div
                  style={{
                    display: "flex",
                    color: colors.mutedForeground,
                    fontSize: 10,
                  }}
                >
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
                <div
                  style={{
                    display: "flex",
                    color: colors.mutedForeground,
                    fontSize: 10,
                  }}
                >
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
            <div
              style={{
                display: "flex",
                color: colors.mutedForeground,
                fontSize: 14,
                marginTop: 4,
              }}
            >
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
              <div
                style={{
                  display: "flex",
                  color: colors.mutedForeground,
                  fontSize: 13,
                }}
              >
                Minimum Payout
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 700,
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
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 240,
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
                color: colors.mutedForeground,
                fontSize: 11,
                marginTop: 6,
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
                color: colors.mutedForeground,
                fontSize: 14,
                marginTop: 6,
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
            <div
              style={{
                display: "flex",
                color: colors.mutedForeground,
                fontSize: 14,
              }}
            >
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
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                marginTop: 6,
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 12,
                background: colors.muted,
                color: colors.foreground,
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
              <div style={{ display: "flex" }}>Pending Setup</div>
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
                <div
                  style={{
                    display: "flex",
                    color: colors.mutedForeground,
                  }}
                >
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
                <div
                  style={{
                    display: "flex",
                    color: colors.mutedForeground,
                  }}
                >
                  Total Ready
                </div>
                <div style={{ display: "flex", fontWeight: 600 }}>
                  $0.00 USD
                </div>
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
            fontSize: 14,
            color: colors.mutedForeground,
          }}
        >
          <div style={{ display: "flex", color: colors.foreground }}>
            dialectcn
          </div>
          <div style={{ display: "flex" }}>{previewCode}</div>
        </div>
      </div>,
      size,
    );
  } catch (err) {
    console.error("[opengraph-image] render failed", err);
    return brandedFallback();
  }
}
