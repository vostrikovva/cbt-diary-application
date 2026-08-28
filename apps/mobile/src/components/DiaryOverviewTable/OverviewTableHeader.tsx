import { Text, View } from "react-native";

import { COL } from "./columnWidths";
import { overviewTableStyles as styles } from "./overviewTableStyles";

type Props = {
  situationWidth: number;
};

export function OverviewTableHeader({ situationWidth }: Props) {
  return (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cell, styles.headerCell, { width: COL.when }]}>Когда</Text>
      <Text style={[styles.cell, styles.headerCell, { width: situationWidth }]}>Ситуация</Text>
      <Text style={[styles.cell, styles.headerCell, { width: COL.scaled }]}>Мысли</Text>
      <Text style={[styles.cell, styles.headerCell, { width: COL.scaled }]}>Эмоции</Text>
      <Text style={[styles.cell, styles.headerCell, { width: COL.scaled }]}>Реакции</Text>
    </View>
  );
}
