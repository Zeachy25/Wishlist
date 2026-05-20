import { initDb } from "@/src/services/dbService";
import { checkPriceDrops } from "@/src/services/supabaseService";
import { useStore } from "@/src/store/useStore";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const user = useStore((state) => state.user);
  const loadUserData = useStore((state) => state.loadUserData);

  useEffect(() => {
    initDb().catch(console.error);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let active = true;

    const pollPriceDrops = async () => {
      if (!user?.id || !active) return;
      const newAlertCount = await checkPriceDrops(user.id);
      if (newAlertCount > 0) {
        loadUserData(user.id);
      }
    };

    if (user?.id) {
      pollPriceDrops();
      interval = setInterval(pollPriceDrops, 1000 * 60 * 30); // every 30 minutes
    }

    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [user?.id, loadUserData]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen
          name="modals/set-alert"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal", headerShown: true }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
