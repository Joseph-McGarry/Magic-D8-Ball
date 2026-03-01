import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, View } from "react-native";
import { useAppStore } from "../state/store";
import { useTheme } from "../theme/useTheme";

export default function AchievementToast() {
  const toast = useAppStore((s) => s.lastAchievementToast);
  const clear = useAppStore((s) => s.clearAchievementToast);
  const t = useTheme();
  const y = useRef(new Animated.Value(20)).current;
  const o = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    y.setValue(20);
    o.setValue(0);

    Animated.parallel([
      Animated.timing(o, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();

    const id = setTimeout(() => {
      Animated.parallel([
        Animated.timing(o, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(y, { toValue: 20, duration: 220, useNativeDriver: true }),
      ]).start(() => clear());
    }, 3500); // 3500ms gives users enough time to read the title and flavor text

    return () => clearTimeout(id);
  }, [toast, clear, y, o]);

  if (!toast) return null;

  return (
    <Animated.View style={[styles.wrap, { opacity: o, transform: [{ translateY: y }] }]}>
      <View style={[styles.card, { borderColor: t.glow }]}>
        <Text style={styles.title}>Achievement unlocked</Text>
        <Text style={styles.name}>{toast.title}</Text>
        {toast.flavor ? <Text style={styles.flavor}>{toast.flavor}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, top: 62, zIndex: 9999 },
  card: {
    backgroundColor: "rgba(0,0,0,0.65)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  title: { color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 12, letterSpacing: 1.0 },
  name: { color: "#fff", fontWeight: "900", fontSize: 16, marginTop: 6 },
  flavor: { color: "rgba(255,255,255,0.78)", fontSize: 12, marginTop: 6 },
});
