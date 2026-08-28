import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme";

export function TagsHeaderLink() {
  return (
    <Link href="/tags" asChild>
      <Pressable>
        <Text style={styles.headerLink}>Теги</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  headerLink: { color: colors.accent, fontWeight: "600", marginRight: 4 },
});
