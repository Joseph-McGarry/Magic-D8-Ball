import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, Text, StyleSheet, TextInput, Platform, KeyboardAvoidingView, ScrollView, Keyboard, Pressable } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import GlassCard from "./GlassCard";
import NeonButton from "./NeonButton";
import { useTheme } from "../theme/useTheme";
import type { ReminderOffset } from "../state/store";

export default function SaveDateModal({
  visible,
  onClose,
  title,
  defaultReminder,
  initialDate,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  defaultReminder: ReminderOffset;
  initialDate?: Date;
  onConfirm: (scheduledAtIso: string, reminderOffset: ReminderOffset, notes?: string) => void;
}) {
  const t = useTheme();
  const [date, setDate] = useState(initialDate ?? new Date());
  const [notes, setNotes] = useState("");
  const [reminderOffset, setReminderOffset] = useState<ReminderOffset>(defaultReminder);

  // Reset state each time the modal opens so stale values don't carry over
  useEffect(() => {
    if (visible) {
      setDate(initialDate ?? new Date());
      setNotes("");
      setReminderOffset(defaultReminder);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduledAtIso = useMemo(() => date.toISOString(), [date]);

  const onChange = (_evt: DateTimePickerEvent, selected?: Date) => {
    if (selected) setDate(selected);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
        <Pressable style={styles.sheet} onPress={() => {}}>
          <GlassCard>
            <Text style={[styles.title, { color: t.text }]}>Save this date</Text>
            <Text style={[styles.sub, { color: t.mutedText }]} numberOfLines={2}>
              {title}
            </Text>

            <View style={{ marginTop: 14 }}>
              <Text style={[styles.label, { color: t.mutedText }]}>Date & time</Text>
              <View style={{ marginTop: 8 }}>
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChange}
                />
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              <Text style={[styles.label, { color: t.mutedText }]}>Reminder</Text>
              <View style={styles.row}>
                {(["none", "1h", "3h", "1d"] as ReminderOffset[]).map((opt) => (
                  <NeonButton
                    key={opt}
                    label={opt === "none" ? "None" : opt === "1h" ? "1h" : opt === "3h" ? "3h" : "1d"}
                    onPress={() => setReminderOffset(opt)}
                    style={[
                      styles.pill,
                      { borderColor: reminderOffset === opt ? t.glow : "rgba(255,255,255,0.20)" },
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              <Text style={[styles.label, { color: t.mutedText }]}>Notes (optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Any details…"
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={[styles.input, { color: t.text, borderColor: "rgba(255,255,255,0.20)" }]}
                multiline
                blurOnSubmit
                returnKeyType="done"
              />
            </View>

            <View style={[styles.row, { marginTop: 14 }]}>
              <NeonButton label="Cancel" onPress={onClose} style={{ flex: 1, marginRight: 10 }} />
              <NeonButton
                label="Save"
                onPress={() => {
                  onConfirm(scheduledAtIso, reminderOffset, notes.trim() ? notes.trim() : undefined);
                  onClose();
                }}
                style={{ flex: 1 }}
              />
            </View>
          </GlassCard>
        </Pressable>
        </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.62)" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 18 },
  sheet: { width: "100%", maxWidth: 520, alignSelf: "center" },
  title: { fontSize: 20, fontWeight: "900" },
  sub: { marginTop: 6, fontSize: 13 },
  label: { fontSize: 12, fontWeight: "800", letterSpacing: 1.0 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    minHeight: 70,
  },
});
