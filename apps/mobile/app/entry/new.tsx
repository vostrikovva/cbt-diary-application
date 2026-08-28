import { Stack, router } from "expo-router";
import { ScrollView } from "react-native";

import { DiaryEntryForm } from "../../src/components/DiaryEntryForm";
import { useDiaryStore } from "../../src/store/useDiaryStore";

export default function NewEntryScreen() {
  const tags = useDiaryStore((state) => state.tags);
  const saveEntry = useDiaryStore((state) => state.saveEntry);
  const createTag = useDiaryStore((state) => state.createTag);

  return (
    <ScrollView>
      <Stack.Screen options={{ title: "Новая запись" }} />
      <DiaryEntryForm
        submitLabel="Сохранить"
        tags={tags}
        onCreateTag={createTag}
        initial={{
          situation: "",
          thoughts: [],
          emotions: [],
          reactions: [],
          tagIds: [],
          occurredAt: null,
        }}
        onSubmit={async (draft) => {
          await saveEntry(draft);
          router.replace("/");
        }}
      />
    </ScrollView>
  );
}
