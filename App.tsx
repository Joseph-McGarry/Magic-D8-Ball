import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme as NavDarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { ThemeProvider } from "./src/theme/ThemeProvider";
import { useTheme } from "./src/theme/useTheme";
import { useAppStore } from "./src/state/store";
import { ensureMigrations } from "./src/storage/migrations";

import BallScreen from "./src/screens/BallScreen";
import PlansScreen from "./src/screens/PlansScreen";
import FilterScreen from "./src/screens/FilterScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import AchievementToast from "./src/components/AchievementToast";

const Tab = createBottomTabNavigator();

function Tabs() {
  const t = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "rgba(0,0,0,0.45)",
          borderTopColor: "rgba(255,255,255,0.08)",
          height: 78,
          paddingTop: 10,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: t.tabActive,
        tabBarInactiveTintColor: "rgba(255,255,255,0.55)",
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === "Ball"
              ? "aperture"
              : route.name === "Plans"
              ? "calendar"
              : route.name === "Filter"
              ? "funnel"
              : "settings";
          return <Ionicons name={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Ball" component={BallScreen} />
      <Tab.Screen name="Plans" component={PlansScreen} />
      <Tab.Screen name="Filter" component={FilterScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    (async () => {
      await ensureMigrations();
      await hydrate();
    })();
  }, [hydrate]);

  if (!hydrated) return null;

  return (
    <ThemeProvider>
      <NavigationContainer theme={NavDarkTheme}>
        <StatusBar style="light" />
        <Tabs />
        <AchievementToast />
      </NavigationContainer>
    </ThemeProvider>
  );
}
