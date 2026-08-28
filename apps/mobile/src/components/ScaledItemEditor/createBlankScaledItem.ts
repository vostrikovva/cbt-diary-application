import { newId } from "../../domain/id";
import type { ScaledItem } from "../../domain/types";

export function createBlankScaledItem(intensity = 5): ScaledItem {
  return { id: newId(), label: "", intensity };
}
