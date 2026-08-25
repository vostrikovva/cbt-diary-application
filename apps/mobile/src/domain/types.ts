export type ScaledItem = {
  id: string;
  label: string;
  intensity: number;
};

export type Tag = {
  id: string;
  name: string;
  isPreset: boolean;
};

export type DiaryEntry = {
  id: string;
  situation: string;
  thoughts: ScaledItem[];
  emotions: ScaledItem[];
  reactions: ScaledItem[];
  tagIds: string[];
  occurredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DiaryEntryDraft = Omit<DiaryEntry, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};
