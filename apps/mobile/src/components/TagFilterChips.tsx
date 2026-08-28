import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Tag } from "../domain/types";
import { colors } from "../theme";

type Props = {
  tags: Tag[];
  selectedTagId: string | null;
  onSelect: (tagId: string | null) => void;
  padded?: boolean;
};

export function TagFilterChips({ tags, selectedTagId, onSelect, padded = true }: Props) {
  return (
    <View style={[styles.filters, !padded && styles.filtersFlush]}>
      <Pressable
        onPress={() => onSelect(null)}
        style={[styles.filter, !selectedTagId && styles.filterOn]}
      >
        <Text style={[styles.filterText, !selectedTagId && styles.filterTextOn]}>Все</Text>
      </Pressable>
      {tags.map((tag) => {
        const on = selectedTagId === tag.id;
        return (
          <Pressable
            key={tag.id}
            onPress={() => onSelect(on ? null : tag.id)}
            style={[styles.filter, on && styles.filterOn]}
          >
            <Text style={[styles.filterText, on && styles.filterTextOn]}>{tag.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 16, paddingBottom: 8 },
  filtersFlush: { padding: 0 },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { color: colors.ink },
  filterTextOn: { color: colors.white },
});
