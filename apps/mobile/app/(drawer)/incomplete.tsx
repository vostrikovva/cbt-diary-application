import { FlatList, StyleSheet, Text, View } from "react-native";

import { CreateEntryFab } from "../../src/components/CreateEntryFab";
import { DiaryEntryCard } from "../../src/components/DiaryEntryCard";
import { isEntryIncomplete } from "../../src/domain/validation";
import { useDiaryStore } from "../../src/store/useDiaryStore";
import { colors } from "../../src/theme";

export default function IncompleteScreen() {
  const entries = useDiaryStore((state) => state.entries);
  const tags = useDiaryStore((state) => state.tags);
  const incomplete = entries.filter(isEntryIncomplete);

  return (
    <View style={styles.screen}>
      <FlatList
        data={incomplete}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Незаполненных событий нет.</Text>}
        renderItem={({ item }) => <DiaryEntryCard entry={item} tags={tags} />}
      />
      <CreateEntryFab />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { padding: 16, paddingBottom: 100, gap: 12 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40 },
});
