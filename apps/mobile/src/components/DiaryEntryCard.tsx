import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { formatWhen, tagNamesForEntry } from "../domain/format";
import type { DiaryEntry, Tag } from "../domain/types";
import { isEntryIncomplete } from "../domain/validation";
import { colors } from "../theme";

type Props = {
  entry: DiaryEntry;
  tags: Tag[];
};

export function DiaryEntryCard({ entry, tags }: Props) {
  const incomplete = isEntryIncomplete(entry);
  const tagNames = tagNamesForEntry(entry, tags);

  return (
    <Link href={`/entry/${entry.id}`} asChild>
      <Pressable style={styles.card}>
        <Text style={styles.when}>{formatWhen(entry.occurredAt ?? entry.createdAt)}</Text>
        <Text style={styles.situation} numberOfLines={3}>
          {entry.situation}
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
}

const styles = StyleSheet.create({
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
});
