import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { formatScaledCell, formatWhen } from "../domain/format";
import type { DiaryEntry } from "../domain/types";
import { isEntryIncomplete } from "../domain/validation";
import { colors } from "../theme";

const COL = {
  when: 108,
  situation: 180,
  scaled: 160,
} as const;

const FIXED_COLS = COL.when + COL.scaled * 3;

type Props = {
  entries: DiaryEntry[];
  onRowPress?: (entryId: string) => void;
};

export function EntriesTable({ entries, onRowPress }: Props) {
  const [viewportWidth, setViewportWidth] = useState(0);
  const situationWidth = Math.max(COL.situation, viewportWidth - FIXED_COLS);
  const tableWidth = FIXED_COLS + situationWidth;

  return (
    <ScrollView
      style={styles.scroll}
      nestedScrollEnabled
      onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
    >
      <ScrollView horizontal nestedScrollEnabled style={styles.scroll}>
        <View style={{ width: tableWidth }}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell, { width: COL.when }]}>Когда</Text>
            <Text style={[styles.cell, styles.headerCell, { width: situationWidth }]}>Ситуация</Text>
            <Text style={[styles.cell, styles.headerCell, { width: COL.scaled }]}>Мысли</Text>
            <Text style={[styles.cell, styles.headerCell, { width: COL.scaled }]}>Эмоции</Text>
            <Text style={[styles.cell, styles.headerCell, { width: COL.scaled }]}>Реакции</Text>
          </View>
          {entries.map((entry) => (
            <TableRow
              key={entry.id}
              entry={entry}
              onPress={onRowPress}
              situationWidth={situationWidth}
            />
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

function TableRow({
  entry,
  onPress,
  situationWidth,
}: {
  entry: DiaryEntry;
  onPress?: (entryId: string) => void;
  situationWidth: number;
}) {
  const incomplete = isEntryIncomplete(entry);
  const body = (
    <Pressable
      onPress={onPress ? () => onPress(entry.id) : undefined}
      style={StyleSheet.flatten([styles.row, incomplete && styles.incompleteRow])}
    >
      <Text style={[styles.cell, { width: COL.when }]}>
        {formatWhen(entry.occurredAt ?? entry.createdAt)}
      </Text>
      <Text style={[styles.cell, styles.situation, { width: situationWidth }]}>
        {entry.situation}
        {incomplete ? "\nОжидает заполнения" : ""}
      </Text>
      <Text style={[styles.cell, { width: COL.scaled }]}>{formatScaledCell(entry.thoughts)}</Text>
      <Text style={[styles.cell, { width: COL.scaled }]}>{formatScaledCell(entry.emotions)}</Text>
      <Text style={[styles.cell, { width: COL.scaled }]}>{formatScaledCell(entry.reactions)}</Text>
    </Pressable>
  );

  if (onPress) {
    return body;
  }

  return (
    <Link href={`/entry/${entry.id}`} asChild>
      {body}
    </Link>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  headerRow: { backgroundColor: colors.accentSoft },
  incompleteRow: { backgroundColor: colors.warnSoft },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  cell: {
    padding: 10,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  headerCell: { fontWeight: "700" },
  situation: {
    fontWeight: "600",
  },
});
