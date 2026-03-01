import React, { useMemo, useRef, useState } from "react";
import { Modal, View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { useTheme } from "../theme/useTheme";
import GlassCard from "./GlassCard";
import NeonButton from "./NeonButton";
import { coinFlip, fiftyFifty } from "../utils/random";
import type { Idea } from "../state/store";

type Phase = "idle" | "call" | "flip" | "result";

export default function FaceOffModal({
  visible,
  onClose,
  ideas,
  yourName,
  partnerName,
  onWinner,
}: {
  visible: boolean;
  onClose: () => void;
  ideas: [Idea, Idea];
  yourName: string;
  partnerName: string;
  onWinner: (winner: Idea) => void;
}) {
  const t = useTheme();
  const [phase, setPhase] = useState<Phase>("idle");
  const [caller, setCaller] = useState<string>("");
  const [call, setCall] = useState<"heads" | "tails" | null>(null);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);

  const spin = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  const mapping = useMemo(() => {
    // Heads -> idea[0], tails -> idea[1]
    return { heads: ideas[0], tails: ideas[1] } as const;
  }, [ideas]);

  const start = () => {
    // Tap coin => pick caller 50/50 and ask them to call it
    const chosen = fiftyFifty(yourName || "Player 1", partnerName || "Player 2");
    setCaller(chosen);
    setPhase("call");
  };

  const confirmCall = (c: "heads" | "tails") => {
    setCall(c);
    setPhase("flip");

    // reset anim
    spin.setValue(0);
    bob.setValue(0);

    // run animation (flip + bob)
    Animated.parallel([
      Animated.timing(spin, { toValue: 1, duration: 850, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(bob, { toValue: -12, duration: 180, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]),
    ]).start(() => {
      const r = coinFlip();
      setResult(r);
      setPhase("result");
    });
  };

  const pickWinner = () => {
    if (!result) return;
    const winner = mapping[result];
    onWinner(winner);
    // cleanup
    setPhase("idle");
    setCaller("");
    setCall(null);
    setResult(null);
    onClose();
  };

  const resetAndClose = () => {
    setPhase("idle");
    setCaller("");
    setCall(null);
    setResult(null);
    onClose();
  };

  // Simulate coin flip with scaleX (rotateY is unsupported on Android).
  // scaleX oscillates 1 → 0 → 1 three times, giving the illusion of three full flips.
  const flipScale = spin.interpolate({
    inputRange: [0, 0.166, 0.333, 0.5, 0.666, 0.833, 1],
    outputRange: [1, 0, 1, 0, 1, 0, 1],
    extrapolate: "clamp",
  });

  const coinLabel =
    phase === "result"
      ? result?.toUpperCase()
      : phase === "flip"
      ? "FLIP"
      : "TAP";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <GlassCard>
            <View style={{ alignItems: "center" }}>
              <Text style={[styles.title, { color: t.text }]}>Face Off</Text>
              <Text style={[styles.sub, { color: t.mutedText }]}>
                Tap the coin. We’ll pick who calls it, 50/50.
              </Text>
            </View>

            <View style={{ marginTop: 14 }}>
              <Pressable onPress={start} disabled={phase !== "idle"} style={{ alignItems: "center" }}>
                <Animated.View
                  style={[
                    styles.coin,
                    {
                      borderColor: t.glow,
                      transform: [{ scaleX: flipScale }, { translateY: bob }],
                    },
                  ]}
                >
                  <Text style={[styles.coinText, { color: "#fff" }]}>{coinLabel}</Text>
                </Animated.View>
              </Pressable>
            </View>

            {phase === "call" ? (
              <View style={{ marginTop: 14 }}>
                <Text style={[styles.callText, { color: t.text }]}>
                  {caller}, call it in the air.
                </Text>
                <View style={styles.row}>
                  <NeonButton label="Heads" onPress={() => confirmCall("heads")} style={{ flex: 1, marginRight: 10 }} />
                  <NeonButton label="Tails" onPress={() => confirmCall("tails")} style={{ flex: 1 }} />
                </View>
              </View>
            ) : null}

            {phase === "result" ? (
              <View style={{ marginTop: 14 }}>
                <Text style={[styles.callText, { color: t.text }]}>
                  {result?.toUpperCase()} wins.
                </Text>
                <Text style={[styles.sub, { color: t.mutedText, marginTop: 6 }]}>
                  {result === "heads" ? ideas[0].title : ideas[1].title}
                </Text>
                <NeonButton label="Save this date" onPress={pickWinner} style={{ marginTop: 14 }} />
              </View>
            ) : null}

            <View style={[styles.row, { marginTop: 14 }]}>
              <NeonButton label="Close" onPress={resetAndClose} style={{ flex: 1 }} />
            </View>
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.62)", justifyContent: "center", padding: 18 },
  sheet: { width: "100%", maxWidth: 520, alignSelf: "center" },
  title: { fontSize: 22, fontWeight: "900" },
  sub: { fontSize: 13, marginTop: 6, textAlign: "center" },
  coin: {
    width: 110,
    height: 110,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  coinText: { fontWeight: "900", letterSpacing: 1.2 },
  callText: { fontSize: 16, fontWeight: "800", textAlign: "center" },
  row: { flexDirection: "row", marginTop: 10 },
});
