export const PRESET_TAGS = [
  { id: "preset-work", name: "Работа", isPreset: true },
  { id: "preset-relations", name: "Отношения", isPreset: true },
  { id: "preset-other", name: "Прочее", isPreset: true },
] as const;

export const EMOTION_SUGGESTIONS = [
  "страх",
  "тревога",
  "злость",
  "стыд",
  "грусть",
  "вина",
  "беспомощность",
] as const;

export const REACTION_SUGGESTIONS = [
  "избегание",
  "замирание",
  "спор",
  "уход в телефон",
  "самокритика",
] as const;

export const INTENSITY_MIN = 0;
export const INTENSITY_MAX = 10;
