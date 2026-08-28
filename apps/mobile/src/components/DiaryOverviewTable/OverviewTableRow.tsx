import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { formatScaledCell, formatWhen } from "../../domain/format";
import type { DiaryEntry } from "../../domain/types";
import { isEntryIncomplete } from "../../domain/validation";
import { COL } from "./columnWidths";
import { overviewTableStyles as styles } from "./overviewTableStyles";

type Props = {
  entry: DiaryEntry;
  onPress?: (entryId: string) => void;
  situationWidth: number;
};

export function OverviewTableRow({ entry, onPress, situationWidth }: Props) {
  const incomplete = isEntryIncomplete(entry);
  const body = (
    <Pressable
      onPress={onPress ? () => onPress(entry.id) : undefined}
      style={StyleSheet.flatten([styles.row, incomplete ? styles.incompleteRow : null])}
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
