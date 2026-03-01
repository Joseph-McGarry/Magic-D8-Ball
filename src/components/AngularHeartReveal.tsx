import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../theme/useTheme";

export default function AngularHeartReveal({
  label,
  height = 220,
}: {
  label?: string;
  height?: number;
}) {
  const t = useTheme();
  return (
    <View style={[styles.wrap, { height }]}>
      <Svg width="100%" height="100%" viewBox="0 0 320 220">
        {/* Angular heart that subtly nods to the classic triangle */}
        <Path
          d="M160 205
             L35 110
             L95 45
             L160 85
             L225 45
             L285 110
             Z"
          fill="rgba(0,0,0,0.35)"
          stroke={t.glow}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        <Path
          d="M160 205
             L35 110
             L95 45
             L160 85
             L225 45
             L285 110
             Z"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </Svg>

      {label ? (
        <View style={styles.labelWrap} pointerEvents="none">
          <Text
            style={[styles.label, { color: "#fff" }]}
            adjustsFontSizeToFit
            numberOfLines={4}
            minimumFontScale={0.45}
          >
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  labelWrap: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 72,
    paddingVertical: 50,
  },
  label: { fontSize: 20, fontWeight: "900", textAlign: "center" },
});
