import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PaymentMethodsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#2962FF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Saved Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Cards</Text>
            <TouchableOpacity>
              <Text style={styles.manageText}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.methodCard}>
            <View style={styles.methodIconContainer}>
              <Text style={{color: '#1A365D', fontWeight: 'bold', fontSize: 10}}>VISA</Text>
            </View>
            <View style={styles.methodDetails}>
              <Text style={styles.methodName}>Visa •••• 4242</Text>
              <Text style={styles.methodSub}>Expires 12/26</Text>
            </View>
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>DEFAULT</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodCard}>
            <View style={styles.methodIconContainer}>
              <View style={styles.mastercardLogo}>
                <View style={[styles.mcCircle, { backgroundColor: '#EB001B', right: -6 }]} />
                <View style={[styles.mcCircle, { backgroundColor: '#F79E1B', left: -6 }]} />
              </View>
            </View>
            <View style={styles.methodDetails}>
              <Text style={styles.methodName}>Mastercard •••• 8810</Text>
              <Text style={styles.methodSub}>Expires 09/25</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999999" />
          </TouchableOpacity>
        </View>

        {/* Other Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Other Methods</Text>
          </View>
          
          <View style={styles.methodsGroup}>
            <TouchableOpacity style={styles.methodGroupItem}>
              <View style={styles.methodIconContainerLarge}>
                <MaterialCommunityIcons name="bank" size={24} color="#1A1A1A" />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>Chase Checking •••• 1902</Text>
                <Text style={styles.methodSub}>Bank Account</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999999" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.methodGroupItem}>
              <View style={styles.methodIconContainerLarge}>
                <MaterialCommunityIcons name="contactless-payment-circle-outline" size={24} color="#1A1A1A" />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>PayPal</Text>
                <Text style={styles.methodSub}>connected: user@example.com</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Button */}
        <View style={styles.addSection}>
          <TouchableOpacity style={styles.addBtn}>
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.addBtnText}>Add New Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <MaterialCommunityIcons name="lock-outline" size={14} color="#666666" style={{ marginRight: 6 }} />
          <Text style={styles.footerText}>Secure 256-bit SSL Encrypted Payment</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F8F9FA', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  iconBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  section: { padding: 16, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0A1A3A' },
  manageText: { fontSize: 14, color: '#2962FF', fontWeight: '500' },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#CCCCCC', padding: 16, marginBottom: 12 },
  methodIconContainer: { width: 48, height: 32, borderRadius: 4, borderWidth: 1, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  mastercardLogo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: 24, height: 16 },
  mcCircle: { width: 14, height: 14, borderRadius: 7, position: 'absolute', opacity: 0.8 },
  methodIconContainerLarge: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  methodDetails: { flex: 1, justifyContent: 'center' },
  methodName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  methodSub: { fontSize: 13, color: '#666666' },
  defaultBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 12 },
  defaultBadgeText: { color: '#2962FF', fontSize: 10, fontWeight: 'bold' },
  methodsGroup: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#CCCCCC' },
  methodGroupItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  divider: { height: 1, backgroundColor: '#E0E0E0' },
  addSection: { paddingHorizontal: 16, marginTop: 24 },
  addBtn: { backgroundColor: '#002255', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 32 },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 13, color: '#666666' },
});
