import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../src/store/useStore';

export default function OrderSuccessScreen() {
  const router = useRouter();
  
  const handleBackToHome = () => {
    // Navigate to the (drawer) root layout
    router.replace('/(drawer)/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="check" size={64} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Order Successful!</Text>
        <Text style={styles.subtitle}>
          Your order has been placed successfully. You will receive an email confirmation shortly.
        </Text>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.homeBtn} onPress={handleBackToHome}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.trackBtn} onPress={() => router.replace('/profile/my-orders')}>
          <Text style={styles.trackBtnText}>Track Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
  homeBtn: {
    backgroundColor: '#1A365D',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackBtn: {
    borderWidth: 1,
    borderColor: '#1A365D',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  trackBtnText: {
    color: '#1A365D',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
