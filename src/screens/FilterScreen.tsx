import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/useTheme";
import { useAppStore } from "../state/store";
import SectionHeader from "../components/SectionHeader";
import GlassCard from "../components/GlassCard";
import NeonButton from "../components/NeonButton";
import { CATEGORIES } from "../data/categories";

export default function FilterScreen() {
  const t = useTheme();
  const filters = useAppStore((s) => s.filters);
  const toggleCategory = useAppStore((s) => s.toggleCategory);
  const setIncludeCustomIdeas = useAppStore((s) => s.setIncludeCustomIdeas);
  const customIdeas = useAppStore((s) => s.customIdeas);
  const addCustomIdea = useAppStore((s) => s.addCustomIdea);
  const deleteCustomIdea = useAppStore((s) => s.deleteCustomIdea);
  const pool = useAppStore((s) => s.getPoolIdeas());

  const [title, setTitle] = useState("");

  const enabledCount = useMemo(
    () => Object.values(filters.categoriesEnabled).filter(Boolean).length,
    [filters.categoriesEnabled]
  );

  return (
    <LinearGradient colors={t.background} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={[styles.h1, { color: t.text }]}>Filter</Text>
        <Text style={[styles.sub, { color: t.mutedText }]}>
          Choose what can appear in your roll pool.
        </Text>

        <SectionHeader title="CATEGORIES" />
        <GlassCard>
          <Text style={[styles.meta, { color: t.mutedText }]}>
            Enabled: {enabledCount}/{CATEGORIES.length}
          </Text>
          <View style={styles.grid}>
            {CATEGORIES.map((c) => {
              const on = filters.categoriesEnabled[c];
              return (
                <Pressable
                  key={c}
                  onPress={() => toggleCategory(c)}
                  style={[
                    styles.chip,
                    {
                      borderColor: on ? t.glow : "rgba(255,255,255,0.22)",
                      backgroundColor: on ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)",
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: t.text }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <SectionHeader title="CUSTOM IDEAS" />
        <GlassCard>
          <View style={styles.row}>
            <Text style={[styles.meta, { color: t.mutedText }]}>Include custom ideas</Text>
            <Pressable
              onPress={() => setIncludeCustomIdeas(!filters.includeCustomIdeas)}
              style={[
                styles.toggle,
                { borderColor: filters.includeCustomIdeas ? t.glow : "rgba(255,255,255,0.24)" },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>
                {filters.includeCustomIdeas ? "ON" : "OFF"}
              </Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 12 }}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Add a custom date idea…"
              placeholderTextColor="rgba(255,255,255,0.45)"
              style={[styles.input, { color: t.text, borderColor: "rgba(255,255,255,0.20)" }]}
            />
            <NeonButton
              label="Add custom idea"
              onPress={() => {
                addCustomIdea(title);
                setTitle("");
              }}
              style={{ marginTop: 10 }}
              disabled={!title.trim()}
            />
          </View>

          {customIdeas.length === 0 ? (
            <Text style={[styles.empty, { color: t.mutedText }]}>
              No custom ideas yet. Add one above.
            </Text>
          ) : (
            <View style={{ marginTop: 12 }}>
              {customIdeas.map((ci) => (
                <View key={ci.id} style={styles.customRow}>
                  <Text style={[styles.customText, { color: t.text }]} numberOfLines={2}>
                    {ci.title}
                  </Text>
                  <Pressable onPress={() => deleteCustomIdea(ci.id)} style={styles.deleteBtn}>
                    <Text style={{ color: "#fff", fontWeight: "900" }}>Delete</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </GlassCard>

        <SectionHeader title="POOL STATUS" />
        <GlassCard>
          <Text style={[styles.meta, { color: t.mutedText }]}>
            Current pool size: {pool.length}
          </Text>
          {pool.length === 0 ? (
            <Text style={[styles.empty, { color: t.mutedText }]}>
              Your pool is empty. Enable at least one category or allow custom ideas.
            </Text>
          ) : null}
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  pad: { paddingTop: 60, paddingHorizontal: 18, paddingBottom: 120 },
  h1: { fontSize: 28, fontWeight: "1000" as any },
  sub: { marginTop: 8, marginBottom: 12, fontSize: 13 },
  meta: { fontSize: 12, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  chip: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: "900" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  toggle: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  input: { borderWidth: 1, borderRadius: 14, padding: 12 },
  empty: { marginTop: 12, fontSize: 12, lineHeight: 16 },
  customRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 },
  customText: { flex: 1, fontSize: 13, fontWeight: "800" },
  deleteBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "rgba(255,80,80,0.25)", borderWidth: 1, borderColor: "rgba(255,80,80,0.65)" },
});
