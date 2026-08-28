import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme";

export function CreateEntryFab() {
  return (
    <Link href="/entry/new" asChild>
      <Pressable style={styles.fab}>
        <Text style={styles.fabText}>+ Запись</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  fabText: { color: colors.white, fontWeight: "700" },
});
