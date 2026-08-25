import { Link, Stack } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { isEntryIncomplete } from "../src/domain/validation";
import { useDiaryStore } from "../src/store/useDiaryStore";
import { colors } from "../src/theme";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ListScreen() {
  const entries = useDiaryStore((state) => state.entries);
  const tags = useDiaryStore((state) => state.tags);
  const filterTagId = useDiaryStore((state) => state.filterTagId);
  const setFilterTagId = useDiaryStore((state) => state.setFilterTagId);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: "Дневник СМЭР",
          headerRight: () => (
            <Link href="/tags" asChild>
              <Pressable>
                <Text style={styles.headerLink}>Теги</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      <View style={styles.filters}>
        <Pressable
          onPress={() => void setFilterTagId(null)}
          style={[styles.filter, !filterTagId && styles.filterOn]}
        >
          <Text style={[styles.filterText, !filterTagId && styles.filterTextOn]}>Все</Text>
        </Pressable>
        {tags.map((tag) => {
          const on = filterTagId === tag.id;
          return (
            <Pressable
              key={tag.id}
              onPress={() => void setFilterTagId(on ? null : tag.id)}
              style={[styles.filter, on && styles.filterOn]}
            >
              <Text style={[styles.filterText, on && styles.filterTextOn]}>{tag.name}</Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Пока нет записей. Добавьте первую ситуацию.</Text>}
        renderItem={({ item }) => {
          const incomplete = isEntryIncomplete(item);
          const tagNames = tags.filter((tag) => item.tagIds.includes(tag.id)).map((tag) => tag.name);
          return (
            <Link href={`/entry/${item.id}`} asChild>
              <Pressable style={styles.card}>
                <Text style={styles.when}>{formatWhen(item.occurredAt ?? item.createdAt)}</Text>
                <Text style={styles.situation} numberOfLines={3}>
                  {item.situation}
                </Text>
                {incomplete ? <Text style={styles.incomplete}>Ожидает заполнения</Text> : null}
                {tagNames.length > 0 ? (
                  <Text style={styles.tags} numberOfLines={1}>
                    {tagNames.join(" · ")}
                  </Text>
                ) : null}
              </Pressable>
            </Link>
          );
        }}
      />
      <Link href="/entry/new" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+ Запись</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerLink: { color: colors.accent, fontWeight: "600", marginRight: 4 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 16, paddingBottom: 8 },
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
  list: { padding: 16, paddingBottom: 100, gap: 12 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
  },
  when: { color: colors.muted, fontSize: 12 },
  situation: { color: colors.ink, fontSize: 16, fontWeight: "600" },
  incomplete: { color: colors.warn, fontSize: 13 },
  tags: { color: colors.accent, fontSize: 13 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  fabText: { color: colors.white, fontWeight: "700" },
});
