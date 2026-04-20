import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { like, preset } from "@/lib/db/schema";
import type { PresetSummary } from "@/lib/services/presets";

export async function isLiked(userId: string, presetId: string) {
  const rows = await db
    .select()
    .from(like)
    .where(and(eq(like.userId, userId), eq(like.presetId, presetId)))
    .limit(1);
  return rows.length > 0;
}

export async function toggleLike(input: {
  userId: string;
  presetId: string;
}): Promise<{ liked: boolean; likesCount: number }> {
  const existing = await db
    .select()
    .from(like)
    .where(
      and(eq(like.userId, input.userId), eq(like.presetId, input.presetId)),
    )
    .limit(1);

  if (existing.length > 0) {
    const [, updated] = await db.batch([
      db
        .delete(like)
        .where(
          and(eq(like.userId, input.userId), eq(like.presetId, input.presetId)),
        ),
      db
        .update(preset)
        .set({ likesCount: sql`GREATEST(${preset.likesCount} - 1, 0)` })
        .where(eq(preset.id, input.presetId))
        .returning({ count: preset.likesCount }),
    ]);
    return { liked: false, likesCount: updated[0]?.count ?? 0 };
  }

  const [, updated] = await db.batch([
    db
      .insert(like)
      .values({ userId: input.userId, presetId: input.presetId }),
    db
      .update(preset)
      .set({ likesCount: sql`${preset.likesCount} + 1` })
      .where(eq(preset.id, input.presetId))
      .returning({ count: preset.likesCount }),
  ]);
  return { liked: true, likesCount: updated[0]?.count ?? 0 };
}

const LIKES_PAGE_SIZE = 24;

export async function listLikedByUser(input: {
  userId: string;
  cursor?: string;
  limit?: number;
}): Promise<{ items: PresetSummary[]; nextCursor: string | null }> {
  const limit = input.limit ?? LIKES_PAGE_SIZE;
  const cursorDate = input.cursor ? new Date(input.cursor) : null;

  const rows = await db
    .select({
      id: preset.id,
      code: preset.code,
      name: preset.name,
      description: preset.description,
      source: preset.source,
      brandSlug: preset.brandSlug,
      likesCount: preset.likesCount,
      createdAt: preset.createdAt,
      likedAt: like.createdAt,
    })
    .from(like)
    .innerJoin(preset, eq(like.presetId, preset.id))
    .where(
      cursorDate
        ? and(eq(like.userId, input.userId), sql`${like.createdAt} < ${cursorDate}`)
        : eq(like.userId, input.userId),
    )
    .orderBy(desc(like.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? last.likedAt.toISOString() : null;

  const items: PresetSummary[] = page.map(({ likedAt: _likedAt, ...rest }) => rest);
  return { items, nextCursor };
}

export async function likedPresetIdsByUser(
  userId: string,
  presetIds: string[],
): Promise<Set<string>> {
  if (presetIds.length === 0) return new Set();
  const rows = await db
    .select({ presetId: like.presetId })
    .from(like)
    .where(
      and(
        eq(like.userId, userId),
        sql`${like.presetId} = ANY(${sql.raw(`ARRAY[${presetIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`,
      ),
    );
  return new Set(rows.map((r) => r.presetId));
}
