import { create } from "zustand";

import * as repo from "../data/diaryRepository";
import type { DiaryEntry, DiaryEntryDraft, Tag } from "../domain/types";

type DiaryState = {
  ready: boolean;
  error: string | null;
  entries: DiaryEntry[];
  tags: Tag[];
  hydrate: () => Promise<void>;
  resetSession: () => void;
  saveEntry: (draft: DiaryEntryDraft) => Promise<DiaryEntry>;
  deleteEntry: (id: string) => Promise<void>;
  createTag: (name: string) => Promise<Tag>;
  renameTag: (id: string, name: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
};

export const useDiaryStore = create<DiaryState>((set, get) => ({
  ready: false,
  error: null,
  entries: [],
  tags: [],
  hydrate: async () => {
    try {
      const [tags, entries] = await Promise.all([repo.listTags(), repo.listEntries()]);
      set({ tags, entries, ready: true, error: null });
    } catch (error) {
      set({
        ready: true,
        error: error instanceof Error ? error.message : "Не удалось открыть дневник",
      });
    }
  },
  resetSession: () => {
    set({ ready: false, error: null, entries: [], tags: [] });
  },
  saveEntry: async (draft) => {
    const saved = await repo.saveEntry(draft);
    const [tags, entries] = await Promise.all([repo.listTags(), repo.listEntries()]);
    set({ tags, entries });
    return saved;
  },
  deleteEntry: async (id) => {
    await repo.deleteEntry(id);
    set({ entries: get().entries.filter((entry) => entry.id !== id) });
  },
  createTag: async (name) => {
    const tag = await repo.createTag(name);
    set({ tags: await repo.listTags() });
    return tag;
  },
  renameTag: async (id, name) => {
    await repo.renameTag(id, name);
    const [tags, entries] = await Promise.all([repo.listTags(), repo.listEntries()]);
    set({ tags, entries });
  },
  deleteTag: async (id) => {
    await repo.deleteTag(id);
    const [tags, entries] = await Promise.all([repo.listTags(), repo.listEntries()]);
    set({ tags, entries });
  },
}));
