import DateTimePicker from "@react-native-community/datetimepicker";
import type { Dispatch, SetStateAction } from "react";
import { Platform, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { colors } from "../../theme";

type PickerMode = "date" | "time";

type Props = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  value: Date;
  onChange: Dispatch<SetStateAction<Date>>;
  picker: PickerMode | null;
  onPickerChange: (mode: PickerMode | null) => void;
};

export function EventDateTimePicker({
  enabled,
  onEnabledChange,
  value,
  onChange,
  picker,
  onPickerChange,
}: Props) {
  return (
    <>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Указать дату и время события</Text>
        <Switch value={enabled} onValueChange={onEnabledChange} />
      </View>
      {enabled ? (
        <View style={styles.dateRow}>
          <Pressable style={styles.dateBtn} onPress={() => onPickerChange("date")}>
            <Text style={styles.dateBtnText}>{value.toLocaleDateString("ru-RU")}</Text>
          </Pressable>
          <Pressable style={styles.dateBtn} onPress={() => onPickerChange("time")}>
            <Text style={styles.dateBtnText}>
              {value.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </Pressable>
        </View>
      ) : null}
      {picker ? (
        <DateTimePicker
          value={value}
          mode={picker}
          is24Hour
          onChange={(_, date) => {
            if (Platform.OS === "android") {
              onPickerChange(null);
            }
            if (!date) {
              return;
            }
            onChange((previous) => {
              const next = new Date(previous);
              if (picker === "date") {
                next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              } else {
                next.setHours(date.getHours(), date.getMinutes(), 0, 0);
              }
              return next;
            });
            if (Platform.OS === "ios") {
              onPickerChange(null);
            }
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  switchLabel: { color: colors.ink, flex: 1, paddingRight: 12 },
  dateRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  dateBtn: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dateBtnText: { color: colors.accent, fontWeight: "600" },
});
