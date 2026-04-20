"use server";

import type { PresetSort, PresetView } from "@/lib/domain/source-labels";
import { getCurrentUser } from "@/lib/services/auth";
import { listLikedByUser } from "@/lib/services/likes";
import {
  extractColors,
  extractFonts,
  getRandomCode,
  listPresets,
  type PresetSummary,
  type PresetWithColors,
} from "@/lib/services/presets";

type FetchPresetsInput = {
  source?: PresetView;
  sort?: PresetSort;
  cursor?: string;
};

type FetchPresetsResult = {
  items: PresetWithColors[];
  nextCursor: string | null;
};

async function enrichPresets(items: PresetSummary[]): Promise<PresetWithColors[]> {
  return Promise.all(
    items.map(async (p) => ({
      ...p,
      colors: await extractColors(p.code),
      fonts: extractFonts(p.code),
    })),
  );
}

export async function fetchPresetsAction(
  input: FetchPresetsInput,
): Promise<FetchPresetsResult> {
  if (input.source === "likes") {
    const user = await getCurrentUser();
    if (!user) return { items: [], nextCursor: null };
    const { items, nextCursor } = await listLikedByUser({
      userId: user.id,
      cursor: input.cursor,
    });
    return { items: await enrichPresets(items), nextCursor };
  }

  const { items, nextCursor } = await listPresets({
    source: input.source,
    sort: input.sort,
    cursor: input.cursor,
  });
  return { items: await enrichPresets(items), nextCursor };
}

export async function pickRandomPresetCodeAction(
  exclude?: string,
): Promise<string | null> {
  return getRandomCode(exclude);
}
