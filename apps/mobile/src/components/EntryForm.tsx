import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { EMOTION_SUGGESTIONS, REACTION_SUGGESTIONS } from "../domain/constants";
import { newId } from "../domain/id";
import type { DiaryEntryDraft, Tag } from "../domain/types";
import { situationError } from "../domain/validation";
import { colors } from "../theme";
import { ScaledRowList } from "./ScaledRowList";

type Props = {
  initial: DiaryEntryDraft;
  tags: Tag[];
  submitLabel: string;
  onSubmit: (draft: DiaryEntryDraft) => Promise<void>;
  onCreateTag: (name: string) => Promise<Tag>;
};

function emptyScaled() {
  return [{ id: newId(), label: "", intensity: 5 }];
}

export function EntryForm({ initial, tags, submitLabel, onSubmit, onCreateTag }: Props) {
  const [situation, setSituation] = useState(initial.situation);
  const [thoughts, setThoughts] = useState(
    initial.thoughts.length > 0 ? initial.thoughts : emptyScaled(),
  );
  const [emotions, setEmotions] = useState(
    initial.emotions.length > 0 ? initial.emotions : emptyScaled(),
  );
  const [reactions, setReactions] = useState(
    initial.reactions.length > 0 ? initial.reactions : emptyScaled(),
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
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        id: initial.id,
        situation,
        thoughts,
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
      <Text style={styles.label}>Ситуация *</Text>
      <TextInput
        value={situation}
        onChangeText={setSituation}
        placeholder="Что произошло?"
        placeholderTextColor={colors.muted}
        multiline
        style={styles.area}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Указать дату и время события</Text>
        <Switch value={useCustomDate} onValueChange={setUseCustomDate} />
      </View>
      {useCustomDate ? (
        <View style={styles.dateRow}>
          <Pressable style={styles.dateBtn} onPress={() => setPicker("date")}>
            <Text style={styles.dateBtnText}>{occurredAt.toLocaleDateString("ru-RU")}</Text>
          </Pressable>
          <Pressable style={styles.dateBtn} onPress={() => setPicker("time")}>
            <Text style={styles.dateBtnText}>
              {occurredAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </Pressable>
        </View>
      ) : null}
      {picker ? (
        <DateTimePicker
          value={occurredAt}
          mode={picker}
          is24Hour
          onChange={(_, date) => {
            if (Platform.OS === "android") {
              setPicker(null);
            }
            if (!date) {
              return;
            }
            setOccurredAt((previous) => {
              const next = new Date(previous);
              if (picker === "date") {
                next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              } else {
                next.setHours(date.getHours(), date.getMinutes(), 0, 0);
              }
              return next;
            });
            if (Platform.OS === "ios") {
              setPicker(null);
            }
          }}
        />
      ) : null}

      <ScaledRowList title="Мысли" items={thoughts} onChange={setThoughts} />
      <ScaledRowList
        title="Эмоции"
        items={emotions}
        suggestions={EMOTION_SUGGESTIONS}
        onChange={setEmotions}
      />
      <ScaledRowList
        title="Реакции"
        items={reactions}
        suggestions={REACTION_SUGGESTIONS}
        onChange={setReactions}
      />

      <Text style={styles.label}>Теги</Text>
      <View style={styles.chips}>
        {tags.map((tag) => {
          const on = tagIds.includes(tag.id);
          return (
            <Pressable
              key={tag.id}
              onPress={() => toggleTag(tag.id)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{tag.name}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.newTagRow}>
        <TextInput
          value={newTag}
          onChangeText={setNewTag}
          placeholder="Новый тег"
          placeholderTextColor={colors.muted}
          style={styles.tagInput}
        />
        <Pressable
          onPress={async () => {
            if (!newTag.trim()) {
              return;
            }
            const tag = await onCreateTag(newTag);
            setNewTag("");
            setTagIds((current) => [...current, tag.id]);
          }}
        >
          <Text style={styles.addTag}>Добавить</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.save, saving && styles.saveOff]} onPress={submit} disabled={saving}>
        <Text style={styles.saveText}>{saving ? "Сохранение…" : submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 16, fontWeight: "600", color: colors.ink, marginBottom: 8 },
  area: {
    minHeight: 90,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.ink,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  switchLabel: { color: colors.ink, flex: 1, paddingRight: 12 },
  dateRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  dateBtn: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dateBtnText: { color: colors.accent, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.ink },
  chipTextOn: { color: colors.white },
  newTagRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  tagInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
  },
  addTag: { color: colors.accent, fontWeight: "600" },
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
