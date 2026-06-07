/**
 * Money conversion boundary.
 *
 * The database stores money as INTEGER kobo (smallest currency unit, no floats)
 * per industry best practice. The frontend contract (lib/mockData.ts and all UI)
 * uses whole naira. Services convert at this single boundary: kobo→naira on read,
 * naira→kobo on write. Mock-fallback data is already in naira and is returned
 * as-is (no conversion).
 */

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number): number {
  return Math.round(kobo / 100);
}
