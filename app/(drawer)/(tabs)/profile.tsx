import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../../src/store/useStore';
import { useRouter } from 'expo-router';
import { supabase } from '@/config/supabaseConfig';

export default function ProfileScreen() {
  const router = useRouter();
  const wishlist = useStore(state => state.wishlist);
  const ordersCount = useStore(state => state.ordersCount);
  const user = useStore(state => state.user);

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert("Error", "Failed to log out");
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.user_metadata?.avatar_url ? (
              <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={32} color="#FFFFFF" />
              </View>
            )}
            <TouchableOpacity style={styles.editBtn}>
              <MaterialCommunityIcons name="pencil" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.user_metadata?.full_name || 'User'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/profile/my-orders')}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="package-variant-closed" size={24} color="#1A365D" />
              {ordersCount > 0 && (
                <View style={styles.badgeTopRight}>
                  <Text style={styles.badgeTopRightText}>{ordersCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.actionText}>My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/profile/payment-methods')}>
            <MaterialCommunityIcons name="credit-card-outline" size={24} color="#1A365D" />
            <Text style={styles.actionText}>Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={24} color="#1A365D" />
            <Text style={styles.actionText}>Coupons</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="#1A365D" />
            <Text style={styles.actionText}>Help</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.listItem} onPress={() => router.push('/profile/personal-info')}>
              <MaterialCommunityIcons name="account-outline" size={24} color="#666666" style={styles.listIcon} />
              <Text style={styles.listItemText}>Personal Info</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons name="lock-outline" size={24} color="#666666" style={styles.listIcon} />
              <Text style={styles.listItemText}>Security</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.listItem} onPress={() => router.push('/profile/notifications')}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#666666" style={styles.listIcon} />
              <Text style={styles.listItemText}>Notifications</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color="#666666" style={styles.listIcon} />
              <Text style={styles.listItemText}>Terms of Service</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons name="shield-account-outline" size={24} color="#666666" style={styles.listIcon} />
              <Text style={styles.listItemText}>Privacy Policy</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.listItem} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={24} color="#C62828" style={styles.listIcon} />
              <Text style={[styles.listItemText, { color: '#C62828', fontWeight: 'bold' }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.versionText}>WatchList v2.4.0 (Build 891)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#1A365D',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A365D',
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2962FF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A1A3A',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666666',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  iconWrapper: {
    position: 'relative',
  },
  badgeTopRight: {
    position: 'absolute',
    top: -8,
    right: -10,
    backgroundColor: '#C62828',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeTopRightText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionText: {
    fontSize: 11,
    color: '#1A1A1A',
    marginTop: 8,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A365D',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listIcon: {
    marginRight: 16,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginLeft: 56, // Align with text
  },
  versionText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 12,
    marginTop: 16,
  },
});
