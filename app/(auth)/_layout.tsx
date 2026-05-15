import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  // Hide headers for all auth screens to avoid showing route names like "(auth)/login"
  return <Stack screenOptions={{ headerShown: false }} />;
}
