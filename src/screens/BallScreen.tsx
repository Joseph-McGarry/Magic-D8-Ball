import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Accelerometer } from "expo-sensors";
import * as Haptics from "expo-haptics";

import { useTheme } from "../theme/useTheme";
import { useAppStore, type Idea, type ReminderOffset } from "../state/store";
import AngularHeartReveal from "../components/AngularHeartReveal";
import IdeaCard from "../components/IdeaCard";
import NeonButton from "../components/NeonButton";
import FaceOffModal from "../components/FaceOffModal";
import SaveDateModal from "../components/SaveDateModal";
import GlassCard from "../components/GlassCard";
import { magnitude, thresholdForSensitivity } from "../utils/shake";
import { playTick } from "../utils/sound";

type RollUI = { ideas: Idea[]; error?: "EMPTY_POOL" | "INSUFFICIENT_POOL" };

export default function BallScreen() {
  const t = useTheme();
  const roll = useAppStore((s) => s.roll);
  const settings = useAppStore((s) => s.settings);
  const defaultReminder = useAppStore((s) => s.settings.defaultReminderOffset);
  const recordFaceOff = useAppStore((s) => s.recordFaceOff);

  const [rollUI, setRollUI] = useState<RollUI>({ ideas: [] });
  const [locked, setLocked] = useState(false);

  const [faceOffOpen, setFaceOffOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveIdea, setSaveIdea] = useState<Idea | null>(null);

  const yourName = useAppStore((s) => s.settings.yourName);
  const partnerName = useAppStore((s) => s.settings.partnerName);
  const faceOffMode = useAppStore((s) => s.settings.faceOffMode);

  const wobble = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  // Use a ref for the lock flag so the shake listener doesn't recreate on every roll
  const lockedRef = useRef(false);

  const threshold = useMemo(() => thresholdForSensitivity(settings.shakeSensitivity), [settings.shakeSensitivity]);

  const animateRoll = useCallback(() => {
    wobble.setValue(0);
    ripple.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: -1, duration: 120, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0.7, duration: 120, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]),
      Animated.timing(ripple, { toValue: 1, duration: 520, useNativeDriver: true }),
    ]).start();
  }, [wobble, ripple]);

  const doRoll = useCallback(async () => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);

    if (settings.soundEnabled) playTick();
    if (settings.hapticsEnabled) {
      try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    }

    animateRoll();

    setTimeout(() => {
      const res = roll();
      if ("error" in res) {
        setRollUI({ ideas: [], error: res.error });
      } else {
        setRollUI({ ideas: res.ideas });
      }
      lockedRef.current = false;
      setLocked(false);
    }, 520);
  }, [settings.soundEnabled, settings.hapticsEnabled, animateRoll, roll]);

  // shake listener — only recreates when threshold or doRoll identity changes
  useEffect(() => {
    let sub: any;
    let last = 0;

    Accelerometer.setUpdateInterval(120);
    sub = Accelerometer.addListener((data) => {
      const mag = magnitude(data.x ?? 0, data.y ?? 0, data.z ?? 0);
      const now = Date.now();
      if (mag > threshold && now - last > 1200) {
        last = now;
        doRoll();
      }
    });

    return () => sub && sub.remove();
  }, [threshold, doRoll]);

  const rotation = wobble.interpolate({ inputRange: [-1, 1], outputRange: ["-3deg", "3deg"] });
  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.05] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  const heartLabel = rollUI.ideas.length === 0
    ? faceOffMode ? "FACE OFF" : "SHAKE"
    : rollUI.ideas.length === 1
    ? "DATE IDEA"
    : "TWO IDEAS";

  const selectedIdea = saveIdea;

  const openSave = (idea: Idea) => {
    setSaveIdea(idea);
    setSaveOpen(true);
  };

  const savePlan = useAppStore((s) => s.savePlan);

  const onConfirmSave = async (scheduledAtIso: string, reminderOffset: ReminderOffset, notes?: string) => {
    if (!selectedIdea) return;
    await savePlan({ idea: selectedIdea, scheduledAtIso, reminderOffset, notes });
  };

  const showEmpty = rollUI.error === "EMPTY_POOL";
  const showInsufficient = rollUI.error === "INSUFFICIENT_POOL";

  return (
    <LinearGradient colors={t.background} style={styles.bg}>
      <View style={styles.safePad}>
        <Animated.View style={{ transform: [{ rotate: rotation }, { scale: rippleScale }] }}>
          <AngularHeartReveal label={heartLabel} height={240} />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ripple,
              { opacity: rippleOpacity, borderColor: t.glow, shadowColor: t.glow },
            ]}
          />
        </Animated.View>

        {showEmpty ? (
          <GlassCard style={{ marginBottom: 12 }}>
            <Text style={[styles.emptyTitle, { color: t.text }]}>Your pool is empty</Text>
            <Text style={[styles.emptySub, { color: t.mutedText }]}>
              Enable at least one category (or custom ideas) in Filter, and make sure excluded ideas are re-enabled in Settings → History.
            </Text>
          </GlassCard>
        ) : null}

        {showInsufficient ? (
          <GlassCard style={{ marginBottom: 12 }}>
            <Text style={[styles.emptyTitle, { color: t.text }]}>Not enough ideas for Face Off</Text>
            <Text style={[styles.emptySub, { color: t.mutedText }]}>
              Face Off needs at least 2 ideas in your pool. Enable more categories or add custom ideas in Filter.
            </Text>
          </GlassCard>
        ) : null}

        {rollUI.ideas.length === 1 ? (
          <IdeaCard
            title={rollUI.ideas[0].title}
            category={rollUI.ideas[0].category}
            onPress={() => openSave(rollUI.ideas[0])}
          />
        ) : null}

        {rollUI.ideas.length === 2 ? (
          <View>
            <Text style={[styles.hint, { color: t.mutedText }]}>
              Tap a card if you agree. Use Face Off if you disagree.
            </Text>
            <IdeaCard
              title={rollUI.ideas[0].title}
              category={rollUI.ideas[0].category}
              onPress={() => openSave(rollUI.ideas[0])}
            />
            <IdeaCard
              title={rollUI.ideas[1].title}
              category={rollUI.ideas[1].category}
              onPress={() => openSave(rollUI.ideas[1])}
            />

            <NeonButton
              label="Face Off"
              onPress={() => {
                if (!faceOffMode) {
                  Alert.alert("Face Off mode is off", "Turn on Face Off mode in Settings to roll two ideas per shake.");
                  return;
                }
                setFaceOffOpen(true);
              }}
              style={{ marginTop: 6 }}
              disabled={!faceOffMode}
            />
          </View>
        ) : null}

        <View style={styles.bottomRow}>
          <NeonButton label={locked ? "Rolling…" : "Roll"} onPress={doRoll} style={{ flex: 1 }} disabled={locked} />
        </View>
      </View>

      {/* FaceOff */}
      {rollUI.ideas.length === 2 ? (
        <FaceOffModal
          visible={faceOffOpen}
          onClose={() => setFaceOffOpen(false)}
          ideas={[rollUI.ideas[0], rollUI.ideas[1]]}
          yourName={yourName}
          partnerName={partnerName}
          onWinner={(winner) => {
            recordFaceOff();
            openSave(winner);
          }}
        />
      ) : null}

      {/* Save */}
      <SaveDateModal
        visible={saveOpen}
        onClose={() => setSaveOpen(false)}
        title={saveIdea?.title ?? ""}
        defaultReminder={defaultReminder}
        onConfirm={onConfirmSave}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safePad: { flex: 1, paddingTop: 60, paddingHorizontal: 18, paddingBottom: 110 },
  bottomRow: { position: "absolute", left: 18, right: 18, bottom: 92 },
  ripple: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 30,
    height: 220,
    borderRadius: 28,
    borderWidth: 2,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  hint: { fontSize: 12, marginBottom: 10, fontWeight: "700" },
  emptyTitle: { fontSize: 16, fontWeight: "900" },
  emptySub: { marginTop: 8, fontSize: 12, lineHeight: 16 },
});
