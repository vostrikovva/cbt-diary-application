import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EMOTION_SUGGESTIONS, REACTION_SUGGESTIONS } from "../../domain/constants";
import { newId } from "../../domain/id";
import { applyShareRules, shareBudgetError } from "../../domain/shares";
import type { DiaryEntryDraft, Tag } from "../../domain/types";
import { situationError } from "../../domain/validation";
import { colors } from "../../theme";
import { ScaledItemEditor } from "../ScaledItemEditor";
import { EntryTagSelector } from "./EntryTagSelector";
import { EventDateTimePicker } from "./EventDateTimePicker";
import { SituationTextInput } from "./SituationTextInput";

type Props = {
  initial: DiaryEntryDraft;
  tags: Tag[];
  submitLabel: string;
  onSubmit: (draft: DiaryEntryDraft) => Promise<void>;
  onCreateTag: (name: string) => Promise<Tag>;
};

function createBlankScaledItems() {
  return [{ id: newId(), label: "", intensity: 5 }];
}

export function DiaryEntryForm({ initial, tags, submitLabel, onSubmit, onCreateTag }: Props) {
  const [situation, setSituation] = useState(initial.situation);
  const [thoughts, setThoughts] = useState(() =>
    applyShareRules(initial.thoughts.length > 0 ? initial.thoughts : createBlankScaledItems(), {
      lockSoleToMax: true,
    }),
  );
  const [emotions, setEmotions] = useState(
    initial.emotions.length > 0 ? initial.emotions : createBlankScaledItems(),
  );
  const [reactions, setReactions] = useState(
    initial.reactions.length > 0 ? initial.reactions : createBlankScaledItems(),
  );
  const [tagIds, setTagIds] = useState(initial.tagIds);
  const [useCustomDate, setUseCustomDate] = useState(Boolean(initial.occurredAt));
  const [occurredAt, setOccurredAt] = useState(
    initial.occurredAt ? new Date(initial.occurredAt) : new Date(),
  );
  const [picker, setPicker] = useState<"date" | "time" | null>(null);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggleTag(id: string) {
    setTagIds((current) =>
      current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id],
    );
  }

  async function submit() {
    const message = situationError(situation);
    if (message) {
      setError(message);
      return;
    }
    const nextThoughts = applyShareRules(thoughts, { lockSoleToMax: true });
    const thoughtError = shareBudgetError("thoughts", nextThoughts);
    if (thoughtError) {
      setError(thoughtError);
      return;
    }
    const emotionError = shareBudgetError("emotions", emotions);
    if (emotionError) {
      setError(emotionError);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        id: initial.id,
        situation,
        thoughts: nextThoughts,
        emotions,
        reactions,
        tagIds,
        occurredAt: useCustomDate ? occurredAt.toISOString() : null,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <SituationTextInput value={situation} onChange={setSituation} />
      <EventDateTimePicker
        enabled={useCustomDate}
        onEnabledChange={setUseCustomDate}
        value={occurredAt}
        onChange={setOccurredAt}
        picker={picker}
        onPickerChange={setPicker}
      />
      <ScaledItemEditor
        title="Мысли"
        items={thoughts}
        shareBudget
        lockSoleToMax
        onChange={setThoughts}
      />
      <ScaledItemEditor
        title="Эмоции"
        items={emotions}
        suggestions={EMOTION_SUGGESTIONS}
        shareBudget
        onChange={setEmotions}
      />
      <ScaledItemEditor
        title="Реакции"
        items={reactions}
        suggestions={REACTION_SUGGESTIONS}
        onChange={setReactions}
      />
      <EntryTagSelector
        tags={tags}
        selectedIds={tagIds}
        newTag={newTag}
        onNewTagChange={setNewTag}
        onToggle={toggleTag}
        onCreate={() => {
          void (async () => {
            if (!newTag.trim()) {
              return;
            }
            const tag = await onCreateTag(newTag);
            setNewTag("");
            setTagIds((current) => [...current, tag.id]);
          })();
        }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.save, saving ? styles.saveOff : null]} onPress={submit} disabled={saving}>
        <Text style={styles.saveText}>{saving ? "Сохранение…" : submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: 16, paddingBottom: 40 },
  error: { color: colors.warn, marginBottom: 12 },
  save: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveOff: { opacity: 0.6 },
  saveText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
