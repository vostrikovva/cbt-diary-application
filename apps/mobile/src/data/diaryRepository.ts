import { newId } from "../domain/id";
import { filledItems } from "../domain/validation";
import type { DiaryEntry, DiaryEntryDraft, ScaledItem, Tag } from "../domain/types";
import { getDb } from "./db";

type ScaledRow = {
  id: string;
  entry_id: string;
  sort_order: number;
  label: string;
  intensity: number;
};

function mapScaled(rows: ScaledRow[]): ScaledItem[] {
  return rows
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({
      id: row.id,
      label: row.label,
      intensity: row.intensity,
    }));
}

async function loadScaled(
  table: "entry_thoughts" | "entry_emotions" | "entry_reactions",
  entryId: string,
): Promise<ScaledItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ScaledRow>(
    `SELECT id, entry_id, sort_order, label, intensity FROM ${table} WHERE entry_id = ?`,
    entryId,
  );
  return mapScaled(rows);
}

async function replaceScaled(
  table: "entry_thoughts" | "entry_emotions" | "entry_reactions",
  entryId: string,
  items: ScaledItem[],
): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${table} WHERE entry_id = ?`, entryId);
  const filled = filledItems(items);
  for (let index = 0; index < filled.length; index += 1) {
    const item = filled[index];
    await db.runAsync(
      `INSERT INTO ${table} (id, entry_id, sort_order, label, intensity) VALUES (?, ?, ?, ?, ?)`,
      item.id || newId(),
      entryId,
      index,
      item.label,
      item.intensity,
    );
  }
}

export async function listTags(): Promise<Tag[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string; name: string; is_preset: number }>(
    "SELECT id, name, is_preset FROM tags ORDER BY is_preset DESC, name COLLATE NOCASE",
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    isPreset: row.is_preset === 1,
  }));
}

export async function createTag(name: string): Promise<Tag> {
  const db = await getDb();
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Название тега пустое");
  }
  const id = newId();
  try {
    await db.runAsync("INSERT INTO tags (id, name, is_preset) VALUES (?, ?, 0)", id, trimmed);
  } catch {
    throw new Error("Такой тег уже есть");
  }
  return { id, name: trimmed, isPreset: false };
}

export async function renameTag(id: string, name: string): Promise<void> {
  const db = await getDb();
  const tag = await db.getFirstAsync<{ is_preset: number }>(
    "SELECT is_preset FROM tags WHERE id = ?",
    id,
  );
  if (!tag) {
    throw new Error("Тег не найден");
  }
  if (tag.is_preset === 1) {
    throw new Error("Пресет-теги нельзя переименовать");
  }
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Название тега пустое");
  }
  await db.runAsync("UPDATE tags SET name = ? WHERE id = ?", trimmed, id);
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDb();
  const tag = await db.getFirstAsync<{ is_preset: number }>(
    "SELECT is_preset FROM tags WHERE id = ?",
    id,
  );
  if (!tag) {
    return;
  }
  if (tag.is_preset === 1) {
    throw new Error("Пресет-теги нельзя удалить");
  }
  await db.runAsync("DELETE FROM tags WHERE id = ?", id);
}

async function loadEntry(id: string): Promise<DiaryEntry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: string;
    situation: string;
    occurred_at: string | null;
    created_at: string;
    updated_at: string;
  }>("SELECT id, situation, occurred_at, created_at, updated_at FROM entries WHERE id = ?", id);
  if (!row) {
    return null;
  }
  const tagRows = await db.getAllAsync<{ tag_id: string }>(
    "SELECT tag_id FROM entry_tags WHERE entry_id = ?",
    id,
  );
  const [thoughts, emotions, reactions] = await Promise.all([
    loadScaled("entry_thoughts", id),
    loadScaled("entry_emotions", id),
    loadScaled("entry_reactions", id),
  ]);
  return {
    id: row.id,
    situation: row.situation,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    thoughts,
    emotions,
    reactions,
    tagIds: tagRows.map((item) => item.tag_id),
  };
}

export async function getEntry(id: string): Promise<DiaryEntry | null> {
  return loadEntry(id);
}

export async function listEntries(tagId?: string | null): Promise<DiaryEntry[]> {
  const db = await getDb();
  const rows = tagId
    ? await db.getAllAsync<{ id: string }>(
        `SELECT e.id FROM entries e
         INNER JOIN entry_tags et ON et.entry_id = e.id
         WHERE et.tag_id = ?
         ORDER BY COALESCE(e.occurred_at, e.created_at) DESC`,
        tagId,
      )
    : await db.getAllAsync<{ id: string }>(
        "SELECT id FROM entries ORDER BY COALESCE(occurred_at, created_at) DESC",
      );
  const entries: DiaryEntry[] = [];
  for (const row of rows) {
    const entry = await loadEntry(row.id);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
}

export async function saveEntry(draft: DiaryEntryDraft): Promise<DiaryEntry> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = draft.id ?? newId();
  const existing = draft.id ? await loadEntry(draft.id) : null;
  const createdAt = existing?.createdAt ?? now;
  const situation = draft.situation.trim();

  await db.withTransactionAsync(async () => {
    if (existing) {
      await db.runAsync(
        "UPDATE entries SET situation = ?, occurred_at = ?, updated_at = ? WHERE id = ?",
        situation,
        draft.occurredAt,
        now,
        id,
      );
    } else {
      await db.runAsync(
        "INSERT INTO entries (id, situation, occurred_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        id,
        situation,
        draft.occurredAt,
        createdAt,
        now,
      );
    }
    await replaceScaled("entry_thoughts", id, draft.thoughts);
    await replaceScaled("entry_emotions", id, draft.emotions);
    await replaceScaled("entry_reactions", id, draft.reactions);
    await db.runAsync("DELETE FROM entry_tags WHERE entry_id = ?", id);
    for (const tagId of draft.tagIds) {
      await db.runAsync(
        "INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)",
        id,
        tagId,
      );
    }
  });

  const saved = await loadEntry(id);
  if (!saved) {
    throw new Error("Не удалось сохранить запись");
  }
  return saved;
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM entries WHERE id = ?", id);
}
