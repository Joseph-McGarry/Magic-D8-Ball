import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/useTheme";

export default function SectionHeader({ title }: { title: string }) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.text, { color: t.mutedText }]}>{title}</Text>
      <View style={[styles.line, { backgroundColor: "rgba(255,255,255,0.18)" }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10, marginBottom: 10 },
  text: { fontSize: 12, fontWeight: "800", letterSpacing: 1.1 },
  line: { height: StyleSheet.hairlineWidth, marginTop: 10 },
});
