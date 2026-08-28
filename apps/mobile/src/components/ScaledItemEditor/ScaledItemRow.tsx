import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { ScaledItem } from "../../domain/types";
import { colors } from "../../theme";
import { IntensityTickPicker } from "./IntensityTickPicker";

type Props = {
  item: ScaledItem;
  maxTick: number;
  soleLocked: boolean;
  shareBudget: boolean;
  onLabelChange: (label: string) => void;
  onIntensityChange: (intensity: number) => void;
  onRemove: () => void;
};

export function ScaledItemRow({
  item,
  maxTick,
  soleLocked,
  shareBudget,
  onLabelChange,
  onIntensityChange,
  onRemove,
}: Props) {
  return (
    <View style={styles.row}>
      <TextInput
        value={item.label}
        onChangeText={onLabelChange}
        placeholder="Своё…"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <IntensityTickPicker
        value={item.intensity}
        maxTick={maxTick}
        soleLocked={soleLocked}
        shareBudget={shareBudget}
        onChange={onIntensityChange}
      />
      <Pressable onPress={onRemove}>
        <Text style={styles.remove}>Убрать</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
  remove: { color: colors.muted, fontSize: 13 },
});
