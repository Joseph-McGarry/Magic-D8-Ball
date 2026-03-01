import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/useTheme";
import { useAppStore } from "../state/store";
import SectionHeader from "../components/SectionHeader";
import PlanRow from "../components/PlanRow";
import SaveDateModal from "../components/SaveDateModal";
import { isPast } from "../utils/time";

export default function PlansScreen() {
  const t = useTheme();
  const plans = useAppStore((s) => s.plans);
  const reschedulePlan = useAppStore((s) => s.reschedulePlan);
  const deletePlan = useAppStore((s) => s.deletePlan);
  const cancelPlanReminder = useAppStore((s) => s.cancelPlanReminder);
  const togglePlanDone = useAppStore((s) => s.togglePlanDone);
  const defaultReminder = useAppStore((s) => s.settings.defaultReminderOffset);

  const [editing, setEditing] = useState<{ id: string; title: string; scheduledAtIso: string } | null>(null);

  const upcoming = useMemo(
    () => plans
      .filter((p) => !isPast(p.scheduledAtIso) && !p.completedAtIso)
      .sort((a, b) => (a.scheduledAtIso < b.scheduledAtIso ? -1 : 1)),
    [plans]
  );
  const past = useMemo(
    () => plans
      .filter((p) => isPast(p.scheduledAtIso) || !!p.completedAtIso)
      .sort((a, b) => (b.scheduledAtIso < a.scheduledAtIso ? -1 : 1)),
    [plans]
  );

  return (
    <LinearGradient colors={t.background} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={[styles.h1, { color: t.text }]}>Plans</Text>
        <Text style={[styles.sub, { color: t.mutedText }]}>Your saved dates and reminders.</Text>

        <SectionHeader title="UPCOMING" />
        {upcoming.length === 0 ? (
          <Text style={[styles.empty, { color: t.mutedText }]}>Nothing upcoming yet. Save a date from the Ball.</Text>
        ) : (
          upcoming.map((p) => (
            <PlanRow
              key={p.id}
              plan={p}
              onReschedule={() => setEditing({ id: p.id, title: p.title, scheduledAtIso: p.scheduledAtIso })}
              onCancelReminder={async () => {
                await cancelPlanReminder(p.id);
              }}
              onToggleDone={() => togglePlanDone(p.id)}
              onDelete={async () => {
                Alert.alert("Delete plan?", "This will remove it and cancel any reminder.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => { void deletePlan(p.id); } },
                ]);
              }}
            />
          ))
        )}

        <SectionHeader title="PAST" />
        {past.length === 0 ? (
          <Text style={[styles.empty, { color: t.mutedText }]}>No past plans yet.</Text>
        ) : (
          past.map((p) => (
            <PlanRow
              key={p.id}
              plan={p}
              onReschedule={() => setEditing({ id: p.id, title: p.title, scheduledAtIso: p.scheduledAtIso })}
              onCancelReminder={async () => {
                await cancelPlanReminder(p.id);
              }}
              onToggleDone={() => togglePlanDone(p.id)}
              onDelete={async () => {
                Alert.alert("Delete plan?", "This will remove it and cancel any reminder.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => { void deletePlan(p.id); } },
                ]);
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Reuse SaveDateModal as rescheduler */}
      <SaveDateModal
        visible={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.title ?? ""}
        defaultReminder={defaultReminder}
        initialDate={editing?.scheduledAtIso ? new Date(editing.scheduledAtIso) : undefined}
        onConfirm={async (scheduledAtIso, reminderOffset) => {
          if (!editing) return;
          await reschedulePlan(editing.id, scheduledAtIso, reminderOffset);
          setEditing(null);
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  pad: { paddingTop: 60, paddingHorizontal: 18, paddingBottom: 120 },
  h1: { fontSize: 28, fontWeight: "1000" as any },
  sub: { marginTop: 8, marginBottom: 12, fontSize: 13 },
  empty: { marginTop: 8, marginBottom: 16, fontSize: 12 },
});
