import { initDb } from "@/src/services/dbService";
import { checkPriceDrops } from "@/src/services/supabaseService";
import { useStore } from "@/src/store/useStore";
import { supabase } from "@/config/supabaseConfig";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const loadUserData = useStore((state) => state.loadUserData);
  const router = useRouter();

  useEffect(() => {
    initDb().catch(console.error);
  }, []);

  // Listen for OAuth redirects (Google, Facebook) and auth state changes
  const navigated = useRef(false);
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          if (event === "SIGNED_IN" && !navigated.current) {
            navigated.current = true;
            router.replace("/(drawer)/(tabs)/home");
          }
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let active = true;

    const pollPriceDrops = async () => {
      if (!user?.id || !active) return;
      const newAlertCount = await checkPriceDrops(user.id);
      if (newAlertCount > 0) {
        loadUserData(user.id);
        Alert.alert(
          "Price Drop Alert",
          `You have ${newAlertCount} new wishlist price drop${newAlertCount > 1 ? "s" : ""}!`,
        );
      }
    };

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        pollPriceDrops();
        interval = setInterval(pollPriceDrops, 1000 * 15);
      } else {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    if (user?.id) {
      pollPriceDrops();
      interval = setInterval(pollPriceDrops, 1000 * 15); // every 15 seconds
    }

    return () => {
      active = false;
      if (interval) clearInterval(interval);
      subscription.remove();
    };
  }, [user?.id, loadUserData]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(drawer)" />
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
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
