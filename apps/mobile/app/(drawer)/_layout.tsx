import { Drawer } from "expo-router/drawer";

import { TagsScreenButton } from "../../src/components/TagsScreenButton";
import { colors } from "../../src/theme";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerTintColor: colors.accent,
        headerTitleStyle: { color: colors.ink },
        headerStyle: { backgroundColor: colors.bg },
        sceneStyle: { backgroundColor: colors.bg },
        drawerActiveTintColor: colors.accent,
        drawerInactiveTintColor: colors.ink,
        drawerStyle: { backgroundColor: colors.bg },
        headerRight: () => <TagsScreenButton />,
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Все события", drawerLabel: "Все события" }} />
      <Drawer.Screen
        name="table"
        options={{ title: "Итоговая таблица", drawerLabel: "Итоговая таблица" }}
      />
      <Drawer.Screen
        name="incomplete"
        options={{ title: "Незаполненные", drawerLabel: "Незаполненные" }}
      />
      <Drawer.Screen
        name="security"
        options={{ title: "Безопасность", drawerLabel: "Безопасность" }}
      />
    </Drawer>
  );
}
