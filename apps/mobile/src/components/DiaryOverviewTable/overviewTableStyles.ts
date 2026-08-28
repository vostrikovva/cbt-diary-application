import { StyleSheet } from "react-native";

import { colors } from "../../theme";

export const overviewTableStyles = StyleSheet.create({
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
