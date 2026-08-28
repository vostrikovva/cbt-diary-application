import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DiaryOverviewTable } from "../../src/components/DiaryOverviewTable";
import { TagFilterBar } from "../../src/components/TagFilterBar";
import { entriesWithTag } from "../../src/domain/format";
import { lockLandscape, lockPortrait } from "../../src/orientation";
import { useDiaryStore } from "../../src/store/useDiaryStore";
import { colors } from "../../src/theme";

export default function TableScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const entries = useDiaryStore((state) => state.entries);
  const tags = useDiaryStore((state) => state.tags);
  const [filterTagId, setFilterTagId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const visible = entriesWithTag(entries, filterTagId);
  const canFullscreen = visible.length > 0;

  useEffect(() => {
    return () => {
      void lockPortrait().catch(() => undefined);
    };
  }, []);

  async function closeFullscreen() {
    try {
      await lockPortrait();
    } catch {
      // Still leave landscape mode in the UI.
    }
    setFullscreen(false);
  }

  async function openFullscreen() {
    try {
      await lockLandscape();
      setFullscreen(true);
    } catch {
      Alert.alert("Не удалось повернуть экран");
    }
  }

  async function openEntry(entryId: string) {
    try {
      await lockPortrait();
    } catch {
      // Navigate anyway so the user is not stuck in the modal.
    }
    setFullscreen(false);
    router.push(`/entry/${entryId}`);
  }

  function emptyMessage() {
    return (
      <Text style={styles.empty}>
        {filterTagId ? "Нет записей с выбранным тегом." : "Пока нет записей."}
      </Text>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <View style={styles.filters}>
          <TagFilterBar
            tags={tags}
            selectedTagId={filterTagId}
            onSelect={setFilterTagId}
            padded={false}
          />
        </View>
        <Pressable
          onPress={() => {
            void openFullscreen();
          }}
          disabled={!canFullscreen}
          style={styles.fullscreenBtn}
        >
          <Text style={[styles.fullscreenText, !canFullscreen && styles.fullscreenOff]}>
            На весь экран
          </Text>
        </Pressable>
      </View>
      {visible.length === 0 ? (
        emptyMessage()
      ) : (
        <View style={styles.cardSlot}>
          <View style={styles.card}>
            <DiaryOverviewTable entries={visible} />
          </View>
        </View>
      )}
      <Modal
        visible={fullscreen}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
        hardwareAccelerated
        supportedOrientations={["landscape", "landscape-left", "landscape-right"]}
        onRequestClose={() => {
          void closeFullscreen();
        }}
      >
        <View style={[styles.modal]}>
          <View
            style={[
              styles.toolbar,
              {
                paddingTop: Math.max(insets.top, 8),
                paddingLeft: Math.max(insets.left, 16),
                paddingRight: Math.max(insets.right, 16),
              },
            ]}
          >
            <Pressable
              onPress={() => {
                void closeFullscreen();
              }}
              style={styles.closeBtn}
            >
              <Text style={styles.fullscreenText}>Закрыть</Text>
            </Pressable>
            <View style={styles.filters}>
              <TagFilterBar
                tags={tags}
                selectedTagId={filterTagId}
                onSelect={setFilterTagId}
                padded={false}
              />
            </View>
          </View>
          {visible.length === 0 ? (
            emptyMessage()
          ) : (
            <View
              style={[
                styles.cardSlot,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <View style={styles.card}>
                <DiaryOverviewTable entries={visible} onRowPress={openEntry} />
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minWidth: 0 },
  modal: {
    minWidth: 0,
    height: "100%",
    width: "100%",
    backgroundColor: colors.bg,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filters: { flex: 1 },
  fullscreenBtn: { paddingVertical: 6 },
  closeBtn: { paddingVertical: 6, paddingRight: 4 },
  fullscreenText: { color: colors.accent, fontWeight: "600" },
  fullscreenOff: { opacity: 0.6 },
  cardSlot: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
  },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40, paddingHorizontal: 16 },
});
