import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { lockPortrait } from "../src/orientation";
import { useDiaryStore } from "../src/store/useDiaryStore";
import { colors } from "../src/theme";

export default function RootLayout() {
  const hydrate = useDiaryStore((state) => state.hydrate);
  const ready = useDiaryStore((state) => state.ready);
  const error = useDiaryStore((state) => state.error);

  useEffect(() => {
    void hydrate();
    void lockPortrait().catch(() => undefined);
  }, [hydrate]);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.bootText}>Открываем дневник…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.boot}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerTintColor: colors.accent,
            headerTitleStyle: { color: colors.ink },
            headerStyle: { backgroundColor: colors.bg },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="tags" />
          <Stack.Screen name="entry/new" />
          <Stack.Screen name="entry/[id]" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
    gap: 12,
    padding: 24,
  },
  bootText: { color: colors.muted },
  error: { color: colors.warn, textAlign: "center" },
});
