import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { INTENSITY_MAX, INTENSITY_MIN } from "../domain/constants";
import { newId } from "../domain/id";
import type { ScaledItem } from "../domain/types";
import { colors } from "../theme";

type Props = {
  title: string;
  items: ScaledItem[];
  suggestions?: readonly string[];
  onChange: (items: ScaledItem[]) => void;
};

function emptyItem(): ScaledItem {
  return { id: newId(), label: "", intensity: 5 };
}

export function ScaledRowList({ title, items, suggestions, onChange }: Props) {
  const rows = items.length > 0 ? items : [emptyItem()];

  function update(index: number, patch: Partial<ScaledItem>) {
    const next = rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row));
    onChange(next);
  }

  return (
    <View style={styles.block}>
      <Text style={styles.title}>{title}</Text>
      {suggestions && suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {suggestions.map((label) => (
            <Pressable
              key={label}
              style={styles.suggestion}
              onPress={() => onChange([...rows.filter((row) => row.label.trim()), { ...emptyItem(), label }])}
            >
              <Text style={styles.suggestionText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {rows.map((item, index) => (
        <View key={item.id} style={styles.row}>
          <TextInput
            value={item.label}
            onChangeText={(label) => update(index, { label })}
            placeholder="Своё…"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <View style={styles.scale}>
            {Array.from({ length: INTENSITY_MAX - INTENSITY_MIN + 1 }, (_, value) => (
              <Pressable
                key={value}
                onPress={() => update(index, { intensity: value })}
                style={[styles.tick, item.intensity === value && styles.tickOn]}
              >
                <Text style={[styles.tickText, item.intensity === value && styles.tickTextOn]}>{value}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => {
              const next = rows.filter((_, rowIndex) => rowIndex !== index);
              onChange(next.length > 0 ? next : [emptyItem()]);
            }}
          >
            <Text style={styles.remove}>Убрать</Text>
          </Pressable>
        </View>
      ))}
      <Pressable onPress={() => onChange([...rows, emptyItem()])}>
        <Text style={styles.add}>+ строка</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 10, marginBottom: 20 },
  title: { fontSize: 16, fontWeight: "600", color: colors.ink },
  suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestion: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  suggestionText: { color: colors.accent, fontSize: 13 },
  row: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 6,
    fontSize: 16,
    color: colors.ink,
  },
  scale: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tick: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  tickOn: { backgroundColor: colors.accent },
  tickText: { fontSize: 12, color: colors.ink },
  tickTextOn: { color: colors.white, fontWeight: "700" },
  remove: { color: colors.muted, fontSize: 13 },
  add: { color: colors.accent, fontWeight: "600" },
});
