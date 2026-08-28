import { INTENSITY_MAX, INTENSITY_MIN } from "./constants";
import type { ScaledItem } from "./types";
import { clampIntensity } from "./validation";

export const SHARE_BUDGET = INTENSITY_MAX;

export function isFilledItem(item: Pick<ScaledItem, "label">): boolean {
  return item.label.trim().length > 0;
}

export function filledShareSum(items: ScaledItem[]): number {
  return items.filter(isFilledItem).reduce((sum, item) => sum + item.intensity, 0);
}

export function remainingShare(items: ScaledItem[], index: number): number {
  const others = items.reduce((sum, item, itemIndex) => {
    if (itemIndex === index || !isFilledItem(item)) {
      return sum;
    }
    return sum + item.intensity;
  }, 0);
  return SHARE_BUDGET - others;
}

export function shareBudgetError(kind: "thoughts" | "emotions", items: ScaledItem[]): string | null {
  if (filledShareSum(items) > SHARE_BUDGET) {
    return kind === "thoughts"
      ? "Сумма долей мыслей не больше 10"
      : "Сумма долей эмоций не больше 10";
  }
  return null;
}

export function applyShareRules(
  items: ScaledItem[],
  options: { lockSoleToMax: boolean },
): ScaledItem[] {
  let next = items.map((item) => ({
    ...item,
    intensity: clampIntensity(item.intensity),
  }));

  const filled = next.filter(isFilledItem);
  const sole = filled.length === 1 ? filled[0] : undefined;
  if (options.lockSoleToMax && sole) {
    next = next.map((item) => (item.id === sole.id ? { ...item, intensity: SHARE_BUDGET } : item));
  }

  return next.map((item, index) => {
    if (!isFilledItem(item)) {
      return item;
    }
    const max = remainingShare(next, index);
    if (item.intensity > max) {
      return { ...item, intensity: Math.max(INTENSITY_MIN, max) };
    }
    return item;
  });
}

export function defaultShareIntensity(items: ScaledItem[]): number {
  const remainder = SHARE_BUDGET - filledShareSum(items);
  return Math.max(INTENSITY_MIN, Math.min(5, remainder));
}
