import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme";

type Props = {
  labels: readonly string[];
  onPick: (label: string) => void;
};

export function PresetLabelChips({ labels, onPick }: Props) {
  return (
    <View style={styles.suggestions}>
      {labels.map((label) => (
        <Pressable key={label} style={styles.suggestion} onPress={() => onPick(label)}>
          <Text style={styles.suggestionText}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestion: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  suggestionText: { color: colors.accent, fontSize: 13 },
});
