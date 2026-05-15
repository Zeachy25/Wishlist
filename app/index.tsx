import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

// A subtle background dot grid component
const DotGridBackground = () => {
  // Approximate the grid based on window dimensions
  const dotSize = 2;
  const spacing = 30;
  const cols = Math.floor(width / spacing) + 1;
  const rows = Math.floor(Dimensions.get("window").height / spacing) + 1;
  const dots = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      dots.push(
        <View
          key={`${i}-${j}`}
          style={{
            position: "absolute",
            top: i * spacing,
            left: j * spacing,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          }}
        />,
      );
    }
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots}
    </View>
  );
};

export default function SplashScreen() {
  const [progress] = useState(new Animated.Value(0));
  const router = useRouter();

  useEffect(() => {
    // Simulate loading progress and listen for the actual value.
    const navigated = { current: false };

    const listenerId = progress.addListener(({ value }) => {
      // Only navigate when the progress has actually reached (or very nearly reached) 1
      if (value >= 0.999 && !navigated.current) {
        navigated.current = true;
        router.replace("/(auth)/login");
      }
    });

    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    });

    anim.start();

    return () => {
      progress.removeListener(listenerId);
      anim.stop();
    };
  }, [progress, router]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.5],
  });

  return (
    <View style={styles.container}>
      <DotGridBackground />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Box */}
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons
            name="bell-ring-outline"
            size={42}
            color="#1c3553"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>WishList</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Shop smart. Track prices. Never{"\n"}overpay.
        </Text>
      </View>

      {/* Footer / Progress Bar */}
      <View style={styles.footer}>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBarFill, { width: progressWidth }]}
          />
        </View>
        <Text style={styles.footerText}>Loading</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C3553", // Match the deep blue background
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
  },
  progressBarContainer: {
    width: width * 0.5,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 2,
  },
  footerText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.4)",
    letterSpacing: 2,
    fontWeight: "600",
  },
});
