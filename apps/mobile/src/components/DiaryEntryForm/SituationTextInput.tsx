import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "../../theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SituationTextInput({ value, onChange }: Props) {
  return (
    <View>
      <Text style={styles.label}>Ситуация *</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Что произошло?"
        placeholderTextColor={colors.muted}
        multiline
        style={styles.area}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, fontWeight: "600", color: colors.ink, marginBottom: 8 },
  area: {
    minHeight: 90,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.ink,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
});
