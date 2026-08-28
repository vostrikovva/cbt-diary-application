export const COL = {
  when: 108,
  situation: 180,
  scaled: 160,
} as const;

export const FIXED_COLS = COL.when + COL.scaled * 3;
