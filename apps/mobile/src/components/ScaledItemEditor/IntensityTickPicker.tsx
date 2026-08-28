import { Pressable, StyleSheet, Text, View } from "react-native";

import { INTENSITY_MAX, INTENSITY_MIN } from "../../domain/constants";
import { colors } from "../../theme";

const TICK_VALUES = Array.from(
  { length: INTENSITY_MAX - INTENSITY_MIN + 1 },
  (_, index) => INTENSITY_MIN + index,
);

type Props = {
  value: number;
  maxTick: number;
  soleLocked: boolean;
  shareBudget: boolean;
  onChange: (intensity: number) => void;
};

export function IntensityTickPicker({ value, maxTick, soleLocked, shareBudget, onChange }: Props) {
  return (
    <View style={styles.scale}>
      {TICK_VALUES.map((tick) => {
        const disabled = shareBudget && (soleLocked || tick > maxTick);
        const on = value === tick;
        return (
          <Pressable
            key={tick}
            onPress={() => {
              if (disabled) {
                return;
              }
              onChange(tick);
            }}
            style={[styles.tick, on ? styles.tickOn : null, disabled ? styles.tickOff : null]}
          >
            <Text
              style={[
                styles.tickText,
                on ? styles.tickTextOn : null,
                disabled ? styles.tickTextOff : null,
              ]}
            >
              {tick}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
  tickOff: { opacity: 0.35 },
  tickText: { fontSize: 12, color: colors.ink },
  tickTextOn: { color: colors.white, fontWeight: "700" },
  tickTextOff: { color: colors.muted },
});
