import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { EntryListCard } from "../../src/components/EntryListCard";
import { NewEntryFab } from "../../src/components/NewEntryFab";
import { TagFilterChips } from "../../src/components/TagFilterChips";
import { entriesWithTag } from "../../src/domain/format";
import { useDiaryStore } from "../../src/store/useDiaryStore";
import { colors } from "../../src/theme";

export default function ListScreen() {
  const entries = useDiaryStore((state) => state.entries);
  const tags = useDiaryStore((state) => state.tags);
  const [filterTagId, setFilterTagId] = useState<string | null>(null);
  const visible = entriesWithTag(entries, filterTagId);

  return (
    <View style={styles.screen}>
      <TagFilterChips tags={tags} selectedTagId={filterTagId} onSelect={setFilterTagId} />
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {filterTagId
              ? "Нет записей с выбранным тегом."
              : "Пока нет записей. Добавьте первую ситуацию."}
          </Text>
        }
        renderItem={({ item }) => <EntryListCard entry={item} tags={tags} />}
      />
      <NewEntryFab />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { padding: 16, paddingBottom: 100, gap: 12 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40 },
});
