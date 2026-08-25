import { Stack } from "expo-router";

import { colors } from "../../../src/theme";

export default function EntryIdLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.accent,
        headerTitleStyle: { color: colors.ink },
        headerStyle: { backgroundColor: colors.bg },
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
