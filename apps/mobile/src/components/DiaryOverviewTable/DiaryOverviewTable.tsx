import { useState } from "react";
import { ScrollView, View } from "react-native";

import type { DiaryEntry } from "../../domain/types";
import { COL, FIXED_COLS } from "./columnWidths";
import { OverviewTableHeader } from "./OverviewTableHeader";
import { OverviewTableRow } from "./OverviewTableRow";
import { overviewTableStyles as styles } from "./overviewTableStyles";

type Props = {
  entries: DiaryEntry[];
  onRowPress?: (entryId: string) => void;
};

export function DiaryOverviewTable({ entries, onRowPress }: Props) {
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
          <OverviewTableHeader situationWidth={situationWidth} />
          {entries.map((entry) => (
            <OverviewTableRow
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
