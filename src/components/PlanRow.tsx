import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import GlassCard from "./GlassCard";
import { useTheme } from "../theme/useTheme";
import { formatWhen } from "../utils/time";
import type { Plan } from "../state/store";

export default function PlanRow({
  plan,
  onReschedule,
  onDelete,
  onCancelReminder,
  onToggleDone,
}: {
  plan: Plan;
  onReschedule: () => void;
  onDelete: () => void;
  onCancelReminder: () => void;
  onToggleDone: () => void;
}) {
  const t = useTheme();
  return (
    <GlassCard style={{ marginBottom: 12 }}>
      <Text style={[styles.title, { color: t.text }]}>{plan.title}</Text>
      <Text style={[styles.when, { color: t.mutedText }]}>{formatWhen(plan.scheduledAtIso)}</Text>
      {plan.notes ? <Text style={[styles.notes, { color: t.mutedText }]}>{plan.notes}</Text> : null}

      <View style={styles.actions}>
        <Action label={plan.completedAtIso ? "Undone" : "Done"} onPress={onToggleDone} glow={t.glow} />
        <Action label="Reschedule" onPress={onReschedule} glow={t.glow} />
        {plan.notificationId ? <Action label="Cancel reminder" onPress={onCancelReminder} glow={t.glow} /> : null}
        <Action label="Delete" onPress={onDelete} glow={t.glow} danger />
      </View>
    </GlassCard>
  );
}

function Action({
  label,
  onPress,
  glow,
  danger,
}: {
  label: string;
  onPress: () => void;
  glow: string;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          borderColor: danger ? "rgba(255,80,80,0.65)" : glow,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.actionText, { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "900" },
  when: { marginTop: 6, fontSize: 12 },
  notes: { marginTop: 8, fontSize: 12, lineHeight: 16 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  action: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  actionText: { fontSize: 12, fontWeight: "800" },
});
