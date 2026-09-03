import { Stack } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { VaultGate } from "../src/components/vault/VaultGate";
import { lockPortrait } from "../src/orientation";
import { VaultContext } from "../src/security/VaultContext";
import {
  hasDeviceUserPresence,
  lockVault,
  migrateToSystem,
} from "../src/security/session";
import type { UnlockMethod } from "../src/security/secureVault";
import { useDiaryStore } from "../src/store/useDiaryStore";
import { colors } from "../src/theme";

const GRACE_MS = 20_000;

export default function RootLayout() {
  const hydrate = useDiaryStore((state) => state.hydrate);
  const resetSession = useDiaryStore((state) => state.resetSession);
  const ready = useDiaryStore((state) => state.ready);
  const error = useDiaryStore((state) => state.error);
  const [vault, setVault] = useState<{ dekHex: string; method: UnlockMethod } | null>(null);
  const [gateEpoch, setGateEpoch] = useState(0);
  const [migrateVisible, setMigrateVisible] = useState(false);
  const vaultRef = useRef(vault);
  const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    vaultRef.current = vault;
  }, [vault]);

  const handleUnlocked = useCallback(
    (dekHex: string, method: UnlockMethod) => {
      setVault({ dekHex, method });
      void hydrate();
    },
    [hydrate],
  );

  const migrateOffered = useRef(false);

  const handleLock = useCallback(() => {
    if (graceTimer.current) {
      clearTimeout(graceTimer.current);
      graceTimer.current = null;
    }
    migrateOffered.current = false;
    void lockVault();
    resetSession();
    setVault(null);
    setMigrateVisible(false);
    setGateEpoch((value) => value + 1);
  }, [resetSession]);

  useEffect(() => {
    void lockPortrait().catch(() => undefined);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "background") {
        if (!vaultRef.current) {
          return;
        }
        graceTimer.current = setTimeout(() => {
          handleLock();
        }, GRACE_MS);
        return;
      }
      if (next === "active" && graceTimer.current) {
        clearTimeout(graceTimer.current);
        graceTimer.current = null;
      }
    });
    return () => {
      sub.remove();
      if (graceTimer.current) {
        clearTimeout(graceTimer.current);
      }
    };
  }, [handleLock]);

  useEffect(() => {
    if (!vault || vault.method !== "pin" || !ready || error || migrateOffered.current) {
      return;
    }
    void hasDeviceUserPresence().then((present) => {
      if (present) {
        migrateOffered.current = true;
        setMigrateVisible(true);
      }
    });
  }, [vault, ready, error]);

  if (!vault) {
    return (
      <View style={styles.flex}>
        <VaultGate key={gateEpoch} onUnlocked={handleUnlocked} />
      </View>
    );
  }

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
    <VaultContext.Provider
      value={{
        dekHex: vault.dekHex,
        method: vault.method,
        setMethod: (method) => setVault((current) => (current ? { ...current, method } : current)),
        lockNow: handleLock,
      }}
    >
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
          <Modal visible={migrateVisible} transparent animationType="fade">
            <View style={styles.modalWrap}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Входить как в телефон?</Text>
                <Text style={styles.bootText}>
                  На устройстве появился код блокировки. Можно больше не использовать PIN дневника.
                </Text>
                <Pressable
                  style={styles.button}
                  onPress={() => {
                    void migrateToSystem(vault.dekHex)
                      .then(() => {
                        setVault({ dekHex: vault.dekHex, method: "system" });
                        setMigrateVisible(false);
                      })
                      .catch(() => setMigrateVisible(false));
                  }}
                >
                  <Text style={styles.buttonText}>Перейти</Text>
                </Pressable>
                <Pressable onPress={() => setMigrateVisible(false)}>
                  <Text style={styles.link}>Позже</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </VaultContext.Provider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
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
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: { color: colors.ink, fontWeight: "700" },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: colors.white, fontWeight: "700" },
  link: { color: colors.accent, textAlign: "center", fontWeight: "600" },
});
