import type { DiaryEntry, ScaledItem, Tag } from "./types";

export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatScaledCell(items: ScaledItem[]): string {
  const filled = items.filter((item) => item.label.trim().length > 0);
  if (filled.length === 0) {
    return "—";
  }
  return filled.map((item) => `${item.label.trim()} · ${item.intensity}`).join("\n");
}

export function tagNamesForEntry(entry: DiaryEntry, tags: Tag[]): string[] {
  return tags.filter((tag) => entry.tagIds.includes(tag.id)).map((tag) => tag.name);
}

export function entriesWithTag(entries: DiaryEntry[], tagId: string | null): DiaryEntry[] {
  if (!tagId) {
    return entries;
  }
  return entries.filter((entry) => entry.tagIds.includes(tagId));
}
