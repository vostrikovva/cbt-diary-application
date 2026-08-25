import { Stack, router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { EntryForm } from "../../../src/components/EntryForm";
import { useDiaryStore } from "../../../src/store/useDiaryStore";

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useDiaryStore((state) => state.entries.find((item) => item.id === id));
  const tags = useDiaryStore((state) => state.tags);
  const saveEntry = useDiaryStore((state) => state.saveEntry);
  const createTag = useDiaryStore((state) => state.createTag);

  if (!entry) {
    return (
      <View>
        <Stack.Screen options={{ title: "Правка" }} />
        <Text>Запись не найдена</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <Stack.Screen options={{ title: "Правка" }} />
      <EntryForm
        submitLabel="Сохранить изменения"
        tags={tags}
        onCreateTag={createTag}
        initial={entry}
        onSubmit={async (draft) => {
          await saveEntry({ ...draft, id: entry.id });
          router.back();
        }}
      />
    </ScrollView>
  );
}
