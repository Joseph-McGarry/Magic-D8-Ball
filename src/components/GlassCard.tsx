import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../theme/useTheme";

export default function GlassCard({
  children,
  style,
  intensity = 28,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}) {
  const t = useTheme();
  return (
    <View style={[styles.wrap, style]}>
      <BlurView intensity={intensity} tint="dark" style={[styles.blur, { borderColor: t.cardBorder }]}>
        <View style={[styles.inner, { backgroundColor: t.card }]}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 20, overflow: "hidden" },
  blur: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  inner: { padding: 14 },
});
