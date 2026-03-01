import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/useTheme";
import GlassCard from "./GlassCard";

export default function IdeaCard({
  title,
  category,
  selected,
  onPress,
}: {
  title: string;
  category: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={{ width: "100%" }}>
      <GlassCard style={[styles.card, { borderWidth: selected ? 1.2 : 0, borderColor: selected ? t.glow : "transparent" }]}>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: t.mutedText }]}>{category}</Text>
          {selected ? <Text style={[styles.meta, { color: t.glow, fontWeight: "800" }]}>Selected</Text> : null}
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "800", lineHeight: 22 },
  metaRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  meta: { fontSize: 12, opacity: 0.95 },
});
