import { Link, Stack, router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { isEntryIncomplete } from "../../../src/domain/validation";
import { useDiaryStore } from "../../../src/store/useDiaryStore";
import { colors } from "../../../src/theme";

export default function EntryViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useDiaryStore((state) => state.entries.find((item) => item.id === id));
  const tags = useDiaryStore((state) => state.tags);
  const deleteEntry = useDiaryStore((state) => state.deleteEntry);

  if (!entry) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: "Запись" }} />
        <Text style={styles.muted}>Запись не найдена</Text>
      </View>
    );
  }

  const tagNames = tags.filter((tag) => entry.tagIds.includes(tag.id)).map((tag) => tag.name);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: "Запись",
          headerRight: () => (
            <Link href={`/entry/${entry.id}/edit`} asChild>
              <Pressable>
                <Text style={styles.headerLink}>Изменить</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      <Text style={styles.when}>
        {new Date(entry.occurredAt ?? entry.createdAt).toLocaleString("ru-RU")}
      </Text>
      {isEntryIncomplete(entry) ? <Text style={styles.incomplete}>Ожидает заполнения</Text> : null}
      <Text style={styles.section}>Ситуация</Text>
      <Text style={styles.body}>{entry.situation}</Text>
      <ScaledBlock title="Мысли" items={entry.thoughts} />
      <ScaledBlock title="Эмоции" items={entry.emotions} />
      <ScaledBlock title="Реакции" items={entry.reactions} />
      {tagNames.length > 0 ? (
        <>
          <Text style={styles.section}>Теги</Text>
          <Text style={styles.body}>{tagNames.join(", ")}</Text>
        </>
      ) : null}
      <Pressable
        style={styles.delete}
        onPress={() => {
          Alert.alert("Удалить запись?", "Её нельзя будет вернуть.", [
            { text: "Отмена", style: "cancel" },
            {
              text: "Удалить",
              style: "destructive",
              onPress: () => {
                void deleteEntry(entry.id).then(() => router.replace("/"));
              },
            },
          ]);
        }}
      >
        <Text style={styles.deleteText}>Удалить</Text>
      </Pressable>
    </ScrollView>
  );
}

function ScaledBlock({
  title,
  items,
}: {
  title: string;
  items: { id: string; label: string; intensity: number }[];
}) {
  if (items.length === 0) {
    return (
      <View>
        <Text style={styles.section}>{title}</Text>
        <Text style={styles.muted}>Не заполнено</Text>
      </View>
    );
  }
  return (
    <View>
      <Text style={styles.section}>{title}</Text>
      {items.map((item) => (
        <Text key={item.id} style={styles.body}>
          {item.label} — {item.intensity}/10
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  missing: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerLink: { color: colors.accent, fontWeight: "600" },
  when: { color: colors.muted },
  incomplete: { color: colors.warn },
  section: { marginTop: 12, fontWeight: "700", color: colors.ink, fontSize: 16 },
  body: { color: colors.ink, fontSize: 16, lineHeight: 22 },
  muted: { color: colors.muted },
  delete: { marginTop: 24, alignItems: "center" },
  deleteText: { color: colors.warn, fontWeight: "600" },
});
