import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/useTheme";
import { THEMES } from "../theme/themes";
import { useAppStore } from "../state/store";
import GlassCard from "../components/GlassCard";
import SectionHeader from "../components/SectionHeader";
import { ACHIEVEMENTS } from "../data/achievements";

export default function SettingsScreen() {
  const t = useTheme();
  const settings = useAppStore((s) => s.settings);
  const setRollCount = useAppStore((s) => s.setRollCount);
  const setTheme = useAppStore((s) => s.setTheme);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);
  const setDefaultReminderOffset = useAppStore((s) => s.setDefaultReminderOffset);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);
  const setHapticsEnabled = useAppStore((s) => s.setHapticsEnabled);
  const setShakeSensitivity = useAppStore((s) => s.setShakeSensitivity);
  const setFaceOffMode = useAppStore((s) => s.setFaceOffMode);
  const setYourName = useAppStore((s) => s.setYourName);
  const setPartnerName = useAppStore((s) => s.setPartnerName);

  const history = useAppStore((s) => s.history);
  const toggleHistoryInclude = useAppStore((s) => s.toggleHistoryInclude);
  const getIdeaById = useAppStore((s) => s.getIdeaById);

  const achievements = useAppStore((s) => s.achievements);

  const faceOffMode = settings.faceOffMode;
  const yourName = settings.yourName;
  const partnerName = settings.partnerName;

  const unlockedCount = useMemo(
    () => Object.values(achievements).filter((a) => a.unlocked).length,
    [achievements]
  );

  const totalHistoryCount = Object.values(history).length;
  const historyItems = useMemo(() => {
    return Object.values(history)
      .sort((a, b) => (b.lastRolledAtIso < a.lastRolledAtIso ? -1 : 1))
      .slice(0, 40);
  }, [history]);

  return (
    <LinearGradient colors={t.background} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={[styles.h1, { color: t.text }]}>Settings</Text>
        <Text style={[styles.sub, { color: t.mutedText }]}>Tuning, history, and extras.</Text>

        <SectionHeader title="ROLL MODE" />
        <GlassCard>
          <Row label="Standard (1 idea per shake)">
            <Pressable
              onPress={() => { setFaceOffMode(false); setRollCount(1); }}
              style={[styles.choice, { borderColor: !faceOffMode ? t.glow : "rgba(255,255,255,0.22)" }]}
            >
              <Text style={styles.choiceText}>ON</Text>
            </Pressable>
          </Row>

          <Row label="Face Off mode (2 ideas per shake)">
            <Pressable
              onPress={() => { setFaceOffMode(true); setRollCount(2); }}
              style={[styles.choice, { borderColor: faceOffMode ? t.glow : "rgba(255,255,255,0.22)" }]}
            >
              <Text style={styles.choiceText}>ON</Text>
            </Pressable>
          </Row>

          <Text style={[styles.note, { color: t.mutedText }]}>
            Face Off mode rolls two ideas and lets you settle disagreements with a coin toss.
          </Text>
        </GlassCard>

        <SectionHeader title="NAMES" />
        <GlassCard>
          <Text style={[styles.meta, { color: t.mutedText }]}>Used for Face Off prompts.</Text>

          <TextInput
            value={yourName}
            onChangeText={setYourName}
            placeholder="Your name"
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={[styles.input, { color: t.text, borderColor: "rgba(255,255,255,0.20)" }]}
          />
          <TextInput
            value={partnerName}
            onChangeText={setPartnerName}
            placeholder="Partner name"
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={[styles.input, { color: t.text, borderColor: "rgba(255,255,255,0.20)", marginTop: 10 }]}
          />
          <Text style={[styles.note, { color: t.mutedText }]}>
            Change these any time.
          </Text>
        </GlassCard>

        <SectionHeader title="THEME" />
        <GlassCard>
          <View style={styles.grid}>
            {THEMES.map((th) => {
              const on = th.id === settings.themeId;
              return (
                <Pressable
                  key={th.id}
                  onPress={() => setTheme(th.id)}
                  style={[styles.themeChip, { borderColor: on ? t.glow : "rgba(255,255,255,0.20)" }]}
                >
                  <Text style={[styles.themeText, { color: t.text }]}>{th.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <SectionHeader title="NOTIFICATIONS" />
        <GlassCard>
          <Row label="Notifications">
            <Pressable
              onPress={() => setNotificationsEnabled(!settings.notificationsEnabled)}
              style={[styles.choice, { borderColor: settings.notificationsEnabled ? t.glow : "rgba(255,255,255,0.22)" }]}
            >
              <Text style={styles.choiceText}>{settings.notificationsEnabled ? "ON" : "OFF"}</Text>
            </Pressable>
          </Row>

          <Text style={[styles.meta, { color: t.mutedText, marginTop: 12 }]}>Default reminder offset</Text>
          <View style={styles.row}>
            {(["none", "1h", "3h", "1d"] as any[]).map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setDefaultReminderOffset(opt)}
                style={[
                  styles.pill,
                  { borderColor: settings.defaultReminderOffset === opt ? t.glow : "rgba(255,255,255,0.20)" },
                ]}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>
                  {opt === "none" ? "None" : opt}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.note, { color: t.mutedText }]}>
            Permission is requested only when you schedule your first reminder.
          </Text>
        </GlassCard>

        <SectionHeader title="SOUND & HAPTICS" />
        <GlassCard>
          <Row label="Sound">
            <Pressable
              onPress={() => setSoundEnabled(!settings.soundEnabled)}
              style={[styles.choice, { borderColor: settings.soundEnabled ? t.glow : "rgba(255,255,255,0.22)" }]}
            >
              <Text style={styles.choiceText}>{settings.soundEnabled ? "ON" : "OFF"}</Text>
            </Pressable>
          </Row>
          <Row label="Haptics">
            <Pressable
              onPress={() => setHapticsEnabled(!settings.hapticsEnabled)}
              style={[styles.choice, { borderColor: settings.hapticsEnabled ? t.glow : "rgba(255,255,255,0.22)" }]}
            >
              <Text style={styles.choiceText}>{settings.hapticsEnabled ? "ON" : "OFF"}</Text>
            </Pressable>
          </Row>

          <Text style={[styles.meta, { color: t.mutedText, marginTop: 12 }]}>Shake sensitivity</Text>
          <View style={styles.row}>
            {[1,2,3,4,5].map((n) => (
              <Pressable
                key={n}
                onPress={() => setShakeSensitivity(n)}
                style={[styles.pill, { borderColor: settings.shakeSensitivity === n ? t.glow : "rgba(255,255,255,0.20)" }]}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </GlassCard>

        <SectionHeader title="HISTORY (POOL CONTROL)" />
        <GlassCard>
          <Text style={[styles.meta, { color: t.mutedText }]}>
            Toggle include/exclude for recently rolled ideas.
          </Text>

          {historyItems.length === 0 ? (
            <Text style={[styles.note, { color: t.mutedText }]}>No rolls yet.</Text>
          ) : (
            <View style={{ marginTop: 10 }}>
              {totalHistoryCount > 40 ? (
                <Text style={[styles.note, { color: t.mutedText, marginBottom: 8 }]}>
                  Showing most recent 40 of {totalHistoryCount}.
                </Text>
              ) : null}
              {historyItems.map((h) => {
                const idea = getIdeaById(h.ideaId);
                if (!idea) return null;
                return (
                  <Pressable
                    key={h.ideaId}
                    onPress={() => toggleHistoryInclude(h.ideaId)}
                    style={[
                      styles.historyRow,
                      { borderColor: h.includeInPool ? "rgba(255,255,255,0.18)" : "rgba(255,80,80,0.65)" },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: t.text, fontWeight: "900" }} numberOfLines={2}>
                        {idea.title}
                      </Text>
                      <Text style={{ color: t.mutedText, fontSize: 12, marginTop: 4 }}>
                        {idea.category} • Rolled {h.timesRolled}x
                      </Text>
                    </View>
                    <Text style={{ color: h.includeInPool ? "#fff" : "rgba(255,80,80,0.95)", fontWeight: "900" }}>
                      {h.includeInPool ? "IN" : "OUT"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </GlassCard>

        <SectionHeader title="ACHIEVEMENTS" />
        <GlassCard>
          <Text style={[styles.meta, { color: t.mutedText }]}>
            Progress: {unlockedCount}/{ACHIEVEMENTS.length}
          </Text>

          <View style={[styles.grid, { marginTop: 12 }]}>
            {ACHIEVEMENTS.map((a) => {
              const st = achievements[a.id];
              const unlocked = st?.unlocked;
              return (
                <View
                  key={a.id}
                  style={[
                    styles.ach,
                    { borderColor: unlocked ? t.glow : "rgba(255,255,255,0.16)", opacity: unlocked ? 1 : 0.75 },
                  ]}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }} numberOfLines={1}>
                    {unlocked ? a.title : "???"}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.70)", fontSize: 11, marginTop: 4 }} numberOfLines={2}>
                    {unlocked ? (a.flavor ?? "") : "Mystery achievement"}
                  </Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        <SectionHeader title="ABOUT" />
        <GlassCard>
          <Text style={[styles.about, { color: t.text }]}>Magic D8 Ball</Text>
          <Text style={[styles.note, { color: t.mutedText }]}>
            Shake to get date ideas. Save plans. Set reminders. Settle disagreements with Face Off.
          </Text>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.rowBetween}>
      <Text style={[styles.meta, { color: t.mutedText }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  pad: { paddingTop: 60, paddingHorizontal: 18, paddingBottom: 120 },
  h1: { fontSize: 28, fontWeight: "1000" as any },
  sub: { marginTop: 8, marginBottom: 12, fontSize: 13 },
  meta: { fontSize: 12, fontWeight: "900", letterSpacing: 0.6 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  choice: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  choiceText: { color: "#fff", fontWeight: "900" },
  note: { marginTop: 10, fontSize: 12, lineHeight: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  themeChip: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  themeText: { fontSize: 12, fontWeight: "900" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  pill: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  input: { borderWidth: 1, borderRadius: 14, padding: 12 },
  historyRow: { flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.10)" },
  ach: { width: "48%", padding: 12, borderRadius: 16, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  about: { fontSize: 16, fontWeight: "1000" as any },
});
