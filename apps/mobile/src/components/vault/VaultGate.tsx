import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  bootstrapVaultGate,
  setAppPin,
  setupVault,
  unlockWithPin,
  unlockWithRecovery,
  unlockWithSystem,
} from "../../security/session";
import type { UnlockMethod } from "../../security/secureVault";
import { colors } from "../../theme";
import { PinForm, RecoveryReveal, vaultStyles } from "./VaultForms";

type Phase =
  | "loading"
  | "setupSystem"
  | "setupPin"
  | "recovery"
  | "locked"
  | "recoveryEntry"
  | "setPin";

type Props = {
  onUnlocked: (dekHex: string, method: UnlockMethod) => void;
};

export function VaultGate({ onUnlocked }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [method, setMethod] = useState<UnlockMethod | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [recoverySaved, setRecoverySaved] = useState(false);
  const [pendingDek, setPendingDek] = useState<string | null>(null);
  const [pendingMethod, setPendingMethod] = useState<UnlockMethod | null>(null);
  const [recoveryInput, setRecoveryInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    void bootstrapVaultGate().then((result) => {
      if (cancelled) {
        return;
      }
      switch (result.kind) {
        case "setup":
          setPhase(result.useSystem ? "setupSystem" : "setupPin");
          break;
        case "locked":
          setMethod(result.method);
          setError(result.error ?? null);
          setPhase("locked");
          break;
        case "unlocked":
          onUnlocked(result.dekHex, result.method);
          break;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [onUnlocked]);

  async function finishSetup(pin?: string) {
    setBusy(true);
    setError(null);
    try {
      const result = await setupVault({ pin });
      setRecoveryKey(result.recoveryKey);
      setPendingDek(result.dekHex);
      setPendingMethod(result.method);
      setPhase("recovery");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось создать дневник");
    } finally {
      setBusy(false);
    }
  }

  if (phase === "loading") {
    return (
      <View style={vaultStyles.screen}>
        <ActivityIndicator color={colors.accent} />
        <Text style={vaultStyles.muted}>Открываем дневник…</Text>
      </View>
    );
  }

  if (phase === "setupSystem") {
    return (
      <View style={vaultStyles.screen}>
        <Text style={styles.title}>Защита дневника</Text>
        <Text style={styles.copy}>
          Вход будет тем же, что и на телефоне: PIN, пароль или отпечаток.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.button, busy ? styles.buttonOff : null]}
          disabled={busy}
          onPress={() => void finishSetup()}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Создать дневник</Text>
          )}
        </Pressable>
      </View>
    );
  }

  if (phase === "setupPin") {
    return (
      <View style={vaultStyles.screen}>
        <PinForm
          busy={busy}
          error={error}
          confirm
          title="Задайте PIN дневника"
          onSubmit={(pin) => void finishSetup(pin)}
        />
      </View>
    );
  }

  if (phase === "recovery" && recoveryKey) {
    return (
      <View style={vaultStyles.screen}>
        <RecoveryReveal
          recoveryKey={recoveryKey}
          saved={recoverySaved}
          busy={busy}
          onToggleSaved={() => setRecoverySaved((value) => !value)}
          onContinue={() => {
            if (pendingMethod && pendingDek) {
              onUnlocked(pendingDek, pendingMethod);
            }
          }}
        />
      </View>
    );
  }

  if (phase === "setPin" && pendingDek) {
    return (
      <View style={vaultStyles.screen}>
        <PinForm
          busy={busy}
          error={error}
          confirm
          title="Задайте PIN дневника"
          onSubmit={(pin) => {
            setBusy(true);
            void setAppPin(pendingDek, pin)
              .then(() => onUnlocked(pendingDek, "pin"))
              .catch((caught: unknown) => {
                setError(caught instanceof Error ? caught.message : "Не удалось сохранить PIN");
              })
              .finally(() => setBusy(false));
          }}
        />
      </View>
    );
  }

  if (phase === "recoveryEntry") {
    return (
      <View style={vaultStyles.screen}>
        <Text style={styles.title}>Ключ восстановления</Text>
        <TextInput
          value={recoveryInput}
          onChangeText={setRecoveryInput}
          autoCapitalize="characters"
          placeholder="XXXX-XXXX-…"
          placeholderTextColor={colors.muted}
          style={styles.input}
          editable={!busy}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.button, busy ? styles.buttonOff : null]}
          disabled={busy}
          onPress={() => {
            setBusy(true);
            setError(null);
            void unlockWithRecovery(recoveryInput)
              .then(({ dekHex, needsAppPin }) => {
                if (needsAppPin) {
                  setPendingDek(dekHex);
                  setPhase("setPin");
                  return;
                }
                onUnlocked(dekHex, method ?? "pin");
              })
              .catch((caught: unknown) => {
                setError(caught instanceof Error ? caught.message : "Ошибка входа");
              })
              .finally(() => setBusy(false));
          }}
        >
          <Text style={styles.buttonText}>Войти</Text>
        </Pressable>
        <Pressable onPress={() => setPhase("locked")}>
          <Text style={styles.link}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={vaultStyles.screen}>
      <Text style={styles.title}>Дневник закрыт</Text>
      {method === "pin" ? (
        <PinForm
          busy={busy}
          error={error}
          title="Введите PIN"
          onSubmit={(pin) => {
            setBusy(true);
            setError(null);
            void unlockWithPin(pin)
              .then((dekHex) => onUnlocked(dekHex, "pin"))
              .catch((caught: unknown) => {
                setError(caught instanceof Error ? caught.message : "Неверный PIN");
              })
              .finally(() => setBusy(false));
          }}
        />
      ) : (
        <View style={styles.block}>
          <Text style={styles.copy}>Используйте код блокировки телефона или отпечаток.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            style={[styles.button, busy ? styles.buttonOff : null]}
            disabled={busy}
            onPress={() => {
              setBusy(true);
              setError(null);
              void unlockWithSystem()
                .then((dekHex) => onUnlocked(dekHex, "system"))
                .catch((caught: unknown) => {
                  setError(caught instanceof Error ? caught.message : "Не удалось войти");
                })
                .finally(() => setBusy(false));
            }}
          >
            <Text style={styles.buttonText}>Разблокировать</Text>
          </Pressable>
        </View>
      )}
      <Pressable onPress={() => setPhase("recoveryEntry")}>
        <Text style={styles.link}>Войти ключом восстановления</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontWeight: "700", fontSize: 22, marginBottom: 8 },
  copy: { color: colors.muted, marginBottom: 16 },
  error: { color: colors.warn, marginBottom: 8 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonOff: { opacity: 0.4 },
  buttonText: { color: colors.white, fontWeight: "700" },
  link: { color: colors.accent, textAlign: "center", marginTop: 16, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    backgroundColor: colors.card,
    marginBottom: 12,
  },
  block: { gap: 12 },
});
