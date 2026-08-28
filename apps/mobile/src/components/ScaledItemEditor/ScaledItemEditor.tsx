import { Pressable, StyleSheet, Text, View } from "react-native";

import { INTENSITY_MAX } from "../../domain/constants";
import { applyShareRules, defaultShareIntensity, remainingShare } from "../../domain/shares";
import type { ScaledItem } from "../../domain/types";
import { colors } from "../../theme";
import { createBlankScaledItem } from "./createBlankScaledItem";
import { PresetLabelChips } from "./PresetLabelChips";
import { ScaledItemRow } from "./ScaledItemRow";

type Props = {
  title: string;
  items: ScaledItem[];
  suggestions?: readonly string[];
  shareBudget?: boolean;
  lockSoleToMax?: boolean;
  onChange: (items: ScaledItem[]) => void;
};

export function ScaledItemEditor({
  title,
  items,
  suggestions,
  shareBudget = false,
  lockSoleToMax = false,
  onChange,
}: Props) {
  const rows = items.length > 0 ? items : [createBlankScaledItem()];
  const labeledCount = rows.filter((row) => row.label.trim()).length;

  function emit(next: ScaledItem[]) {
    onChange(shareBudget ? applyShareRules(next, { lockSoleToMax }) : next);
  }

  function update(index: number, patch: Partial<ScaledItem>) {
    emit(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  return (
    <View style={styles.block}>
      <Text style={styles.title}>{title}</Text>
      {suggestions && suggestions.length > 0 ? (
        <PresetLabelChips
          labels={suggestions}
          onPick={(label) => {
            const kept = rows.filter((row) => row.label.trim());
            const nextIntensity = shareBudget ? defaultShareIntensity(kept) : 5;
            emit([...kept, { ...createBlankScaledItem(nextIntensity), label }]);
          }}
        />
      ) : null}
      {rows.map((item, index) => {
        const maxTick = shareBudget ? remainingShare(rows, index) : INTENSITY_MAX;
        const soleLocked = shareBudget && lockSoleToMax && labeledCount === 1;
        return (
          <ScaledItemRow
            key={item.id}
            item={item}
            maxTick={maxTick}
            soleLocked={soleLocked}
            shareBudget={shareBudget}
            onLabelChange={(label) => update(index, { label })}
            onIntensityChange={(intensity) => update(index, { intensity })}
            onRemove={() => {
              const next = rows.filter((_, rowIndex) => rowIndex !== index);
              emit(next.length > 0 ? next : [createBlankScaledItem()]);
            }}
          />
        );
      })}
      <Pressable
        onPress={() =>
          emit([...rows, createBlankScaledItem(shareBudget ? defaultShareIntensity(rows) : 5)])
        }
      >
        <Text style={styles.add}>+ строка</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 10, marginBottom: 20 },
  title: { fontSize: 16, fontWeight: "600", color: colors.ink },
  add: { color: colors.accent, fontWeight: "600" },
});
