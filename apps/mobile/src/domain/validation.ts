import { INTENSITY_MAX, INTENSITY_MIN } from "./constants";
import type { DiaryEntry, ScaledItem } from "./types";

export function clampIntensity(value: number): number {
  if (Number.isNaN(value)) {
    return INTENSITY_MIN;
  }
  return Math.min(INTENSITY_MAX, Math.max(INTENSITY_MIN, Math.round(value)));
}

export function situationError(situation: string): string | null {
  if (situation.trim().length === 0) {
    return "Опишите ситуацию — это обязательное поле";
  }
  return null;
}

export function isEntryIncomplete(entry: Pick<DiaryEntry, "thoughts" | "emotions" | "reactions">): boolean {
  return (
    !hasFilledItems(entry.thoughts) ||
    !hasFilledItems(entry.emotions) ||
    !hasFilledItems(entry.reactions)
  );
}

export function hasFilledItems(items: ScaledItem[]): boolean {
  return items.some((item) => item.label.trim().length > 0);
}

export function filledItems(items: ScaledItem[]): ScaledItem[] {
  return items
    .filter((item) => item.label.trim().length > 0)
    .map((item) => ({
      ...item,
      label: item.label.trim(),
      intensity: clampIntensity(item.intensity),
    }));
}
