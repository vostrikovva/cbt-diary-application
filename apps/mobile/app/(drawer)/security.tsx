import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PinForm } from "../../src/components/vault/VaultForms";
import { useVault } from "../../src/security/VaultContext";
import {
  changePin,
  hasDeviceUserPresence,
  migrateToSystem,
  revealRecovery,
  rotateRecovery,
  wipeVault,
} from "../../src/security/session";
import { colors } from "../../src/theme";

export default function SecurityScreen() {
  const { dekHex, method, setMethod, lockNow } = useVault();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [currentPin, setCurrentPin] = useState("");
  const [wipeStep, setWipeStep] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.screen} contentInsetAdjustmentBehavior="automatic">
      <Text style={styles.copy}>
        {method === "system"
          ? "Вход: код блокировки телефона или биометрия."
          : "Вход: PIN дневника из 6 цифр."}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {method === "pin" ? (
        <View style={styles.card}>
          <Text style={styles.title}>Сменить PIN</Text>
          <TextInput
            value={currentPin}
            onChangeText={(value) => setCurrentPin(value.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry
            placeholder="Текущий PIN"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <PinForm
            busy={busy}
            error={null}
            confirm
            title="Новый PIN"
            onSubmit={(next) => {
              setBusy(true);
              setError(null);
              void changePin(dekHex, currentPin, next)
                .then(() => {
                  setCurrentPin("");
                  Alert.alert("PIN обновлён");
                })
                .catch((caught: unknown) => {
                  setError(caught instanceof Error ? caught.message : "Не удалось сменить PIN");
                })
                .finally(() => setBusy(false));
            }}
          />
          <Pressable
            onPress={() => {
              void hasDeviceUserPresence().then((present) => {
                if (!present) {
                  setError("Сначала поставьте код блокировки на телефоне");
                  return;
                }
                setBusy(true);
                void migrateToSystem(dekHex)
                  .then(() => setMethod("system"))
                  .catch((caught: unknown) => {
                    setError(caught instanceof Error ? caught.message : "Не удалось перейти");
                  })
                  .finally(() => setBusy(false));
              });
            }}
          >
            <Text style={styles.link}>Входить как в телефон</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.title}>Ключ восстановления</Text>
        {recovery ? (
          <>
            <Text selectable style={styles.key}>
              {recovery}
            </Text>
            <Pressable onPress={() => setRecovery(null)}>
              <Text style={styles.link}>Скрыть ключ</Text>
            </Pressable>
          </>
        ) : null}
        <Pressable
          style={styles.button}
          disabled={busy}
          onPress={() => {
            setBusy(true);
            setError(null);
            void revealRecovery(dekHex)
              .then(setRecovery)
              .catch((caught: unknown) => {
                setError(caught instanceof Error ? caught.message : "Не удалось показать ключ");
              })
              .finally(() => setBusy(false));
          }}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Показать ключ</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => {
            setBusy(true);
            void rotateRecovery(dekHex)
              .then((key) => setRecovery(key))
              .catch((caught: unknown) => {
                setError(caught instanceof Error ? caught.message : "Не удалось обновить ключ");
              })
              .finally(() => setBusy(false));
          }}
        >
          <Text style={styles.link}>Создать новый ключ</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Сброс</Text>
        <Text style={styles.copy}>Удалит все записи и ключи. Это нельзя отменить.</Text>
        <Pressable
          style={styles.warnButton}
          onPress={() => {
            if (!wipeStep) {
              setWipeStep(true);
              return;
            }
            void wipeVault().then(() => {
              lockNow();
            });
          }}
        >
          <Text style={styles.buttonText}>
            {wipeStep ? "Подтвердить удаление" : "Сбросить дневник"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, gap: 16, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  title: { color: colors.ink, fontWeight: "700" },
  copy: { color: colors.muted },
  error: { color: colors.warn },
  key: { color: colors.ink, fontWeight: "700", letterSpacing: 1 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  warnButton: {
    backgroundColor: colors.warn,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: colors.white, fontWeight: "700" },
  link: { color: colors.accent, fontWeight: "600" },
});
