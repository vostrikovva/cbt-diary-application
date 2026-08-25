import { Stack } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useDiaryStore } from "../src/store/useDiaryStore";
import { colors } from "../src/theme";

export default function TagsScreen() {
  const tags = useDiaryStore((state) => state.tags);
  const createTag = useDiaryStore((state) => state.createTag);
  const renameTag = useDiaryStore((state) => state.renameTag);
  const deleteTag = useDiaryStore((state) => state.deleteTag);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: "Теги" }} />
      <Text style={styles.hint}>Пресеты нельзя удалить. Свои теги можно переименовать или убрать.</Text>
      {tags.map((tag) => (
        <View key={tag.id} style={styles.row}>
          {editingId === tag.id ? (
            <>
              <TextInput
                value={editingName}
                onChangeText={setEditingName}
                style={styles.input}
              />
              <Pressable
                onPress={() => {
                  void renameTag(tag.id, editingName).then(() => setEditingId(null));
                }}
              >
                <Text style={styles.link}>Ок</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.name}>
                {tag.name}
                {tag.isPreset ? " · пресет" : ""}
              </Text>
              {!tag.isPreset ? (
                <Pressable
                  onPress={() => {
                    setEditingId(tag.id);
                    setEditingName(tag.name);
                  }}
                >
                  <Text style={styles.link}>Имя</Text>
                </Pressable>
              ) : null}
              {!tag.isPreset ? (
                <Pressable
                  onPress={() => {
                    Alert.alert("Удалить тег?", "Он снимется со всех записей.", [
                      { text: "Отмена", style: "cancel" },
                      {
                        text: "Удалить",
                        style: "destructive",
                        onPress: () => {
                          void deleteTag(tag.id);
                        },
                      },
                    ]);
                  }}
                >
                  <Text style={styles.danger}>Удалить</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      ))}
      <View style={styles.create}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Новый тег"
          placeholderTextColor={colors.muted}
          style={styles.inputGrow}
        />
        <Pressable
          onPress={() => {
            if (!name.trim()) {
              return;
            }
            void createTag(name).then(() => setName(""));
          }}
        >
          <Text style={styles.link}>Создать</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10 },
  hint: { color: colors.muted, marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  name: { flex: 1, color: colors.ink, fontSize: 16 },
  link: { color: colors.accent, fontWeight: "600" },
  danger: { color: colors.warn, fontWeight: "600" },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    color: colors.ink,
    paddingVertical: 4,
  },
  create: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  inputGrow: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
  },
});
