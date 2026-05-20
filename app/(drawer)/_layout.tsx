import { Drawer } from "expo-router/drawer";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerActiveBackgroundColor: "#EBF0F7",
        drawerActiveTintColor: "#1A365D",
        drawerInactiveTintColor: "#555",
        drawerLabelStyle: { fontSize: 15, fontWeight: "500" },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="home"
        options={{
          drawerLabel: "Home",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="browse"
        options={{
          drawerLabel: "Browse",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="wishlist"
        options={{
          drawerLabel: "Wishlist",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="cart"
        options={{
          drawerLabel: "Cart",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
