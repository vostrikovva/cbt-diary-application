import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { Tag } from "../../domain/types";
import { colors } from "../../theme";

type Props = {
  tags: Tag[];
  selectedIds: string[];
  newTag: string;
  onNewTagChange: (value: string) => void;
  onToggle: (id: string) => void;
  onCreate: () => void;
};

export function EntryTagSelector({ tags, selectedIds, newTag, onNewTagChange, onToggle, onCreate }: Props) {
  return (
    <>
      <Text style={styles.label}>Теги</Text>
      <View style={styles.chips}>
        {tags.map((tag) => {
          const on = selectedIds.includes(tag.id);
          return (
            <Pressable
              key={tag.id}
              onPress={() => onToggle(tag.id)}
              style={[styles.chip, on ? styles.chipOn : null]}
            >
              <Text style={[styles.chipText, on ? styles.chipTextOn : null]}>{tag.name}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.newTagRow}>
        <TextInput
          value={newTag}
          onChangeText={onNewTagChange}
          placeholder="Новый тег"
          placeholderTextColor={colors.muted}
          style={styles.tagInput}
        />
        <Pressable onPress={onCreate}>
          <Text style={styles.addTag}>Добавить</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, fontWeight: "600", color: colors.ink, marginBottom: 8 },
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
});
