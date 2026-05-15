import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const user = useStore(state => state.user);

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = async () => {
    try {
      if (user) {
        await updateProfile(user, { displayName: name });
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleSave}>
          <MaterialCommunityIcons name="check" size={24} color="#2962FF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={44} color="#FFFFFF" />
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
              <MaterialCommunityIcons name="camera-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.pageTitle}>{user?.displayName || 'User'}</Text>
          <Text style={styles.pageSubtitle}>{user?.email}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#666666" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#666666" style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: '#999' }]}
                value={email}
                editable={false}
              />
            </View>
          </View>

        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F8F9FA' },
  iconBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  avatarSection: { alignItems: 'center', paddingTop: 16, paddingBottom: 24 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#CCCCCC', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1A365D', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#666666' },
  formSection: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, color: '#333333', marginBottom: 8, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, height: 48 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A', height: '100%' },
  actionsSection: { paddingHorizontal: 24, marginTop: 12 },
  saveBtn: { backgroundColor: '#0A1A3A', borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
