import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "../../theme";
import { PIN_LENGTH } from "../../security/session";

type Props = {
  busy: boolean;
  error: string | null;
  onSubmit: (pin: string) => void;
  title: string;
  confirm?: boolean;
};

export function PinForm({ busy, error, onSubmit, title, confirm = false }: Props) {
  const [pin, setPin] = useState("");
  const [pinAgain, setPinAgain] = useState("");

  const canSubmit = confirm
    ? pin.length === PIN_LENGTH && pin === pinAgain
    : pin.length === PIN_LENGTH;

  return (
    <View style={styles.block}>
      <Text style={styles.title}>{title}</Text>
      <TextInput
        value={pin}
        onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, PIN_LENGTH))}
        keyboardType="number-pad"
        maxLength={PIN_LENGTH}
        secureTextEntry
        placeholder="PIN из 6 цифр"
        placeholderTextColor={colors.muted}
        style={styles.input}
        editable={!busy}
      />
      {confirm ? (
        <TextInput
          value={pinAgain}
          onChangeText={(value) => setPinAgain(value.replace(/\D/g, "").slice(0, PIN_LENGTH))}
          keyboardType="number-pad"
          maxLength={PIN_LENGTH}
          secureTextEntry
          placeholder="Повторите PIN"
          placeholderTextColor={colors.muted}
          style={styles.input}
          editable={!busy}
        />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={[styles.button, !canSubmit || busy ? styles.buttonOff : null]}
        disabled={!canSubmit || busy}
        onPress={() => onSubmit(pin)}
      >
        {busy ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Продолжить</Text>
        )}
      </Pressable>
    </View>
  );
}

export function RecoveryReveal({
  recoveryKey,
  saved,
  onToggleSaved,
  onContinue,
  busy,
}: {
  recoveryKey: string;
  saved: boolean;
  onToggleSaved: () => void;
  onContinue: () => void;
  busy: boolean;
}) {
  return (
    <ScrollView contentContainerStyle={styles.block}>
      <Text style={styles.title}>Ключ восстановления</Text>
      <Text style={styles.copy}>
        Сохраните его отдельно от телефона. Если забудете PIN и не сможете войти системным кодом,
        без этого ключа дневник придётся сбросить.
      </Text>
      <Text selectable style={styles.key}>
        {recoveryKey}
      </Text>
      <Pressable style={styles.checkRow} onPress={onToggleSaved}>
        <View style={[styles.box, saved ? styles.boxOn : null]} />
        <Text style={styles.copy}>Я сохранил ключ</Text>
      </Pressable>
      <Pressable
        style={[styles.button, !saved || busy ? styles.buttonOff : null]}
        disabled={!saved || busy}
        onPress={onContinue}
      >
        <Text style={styles.buttonText}>Готово</Text>
      </Pressable>
    </ScrollView>
  );
}

export const vaultStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    justifyContent: "center",
  },
  muted: { color: colors.muted, textAlign: "center" },
});

const styles = StyleSheet.create({
  block: { gap: 12, paddingVertical: 24 },
  title: { color: colors.ink, fontWeight: "700", fontSize: 22 },
  copy: { color: colors.muted },
  key: {
    color: colors.ink,
    fontWeight: "700",
    letterSpacing: 1,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonOff: { opacity: 0.4 },
  buttonText: { color: colors.white, fontWeight: "700" },
  error: { color: colors.warn },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
});
