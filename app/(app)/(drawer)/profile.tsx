import { useSession } from "@/context";
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const ProfileScreen = () => {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { t } = useTranslation();
  const { signOut, user } = useSession();
  const params = useLocalSearchParams();
  const source = params.source as string || '';

  // ============================================================================
  // Handlers
  // ============================================================================
  
  /**
   * Handles the logout process
   */
  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  // ============================================================================
  // Computed Values
  // ============================================================================
  
  /**
   * Gets the display name for the welcome message
   * Prioritizes user's name, falls back to email, then default greeting
   */
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || t('common.user', 'Guest');

  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <ThemedView style={styles.container} lightColor="#ffffff" darkColor="#ffffff">
      {/* Profile Header with Back Button */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={40} color="#8B5CF6" />
        </View>
        <ThemedText type="title" style={styles.headerTitle}>{t('profile.title', 'My Profile')}</ThemedText>
      </View>

      {/* User Info Section */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <ThemedText type="defaultSemiBold" style={styles.infoLabel}>{t('profile.name', 'Name')}:</ThemedText>
          <ThemedText style={styles.infoValue}>{displayName}</ThemedText>
        </View>
        
        <View style={styles.infoRow}>
          <ThemedText type="defaultSemiBold" style={styles.infoLabel}>{t('profile.emailAddress', 'Email')}:</ThemedText>
          <ThemedText style={styles.infoValue}>{user?.email}</ThemedText>
        </View>
        
        <View style={styles.infoRow}>
          <ThemedText type="defaultSemiBold" style={styles.infoLabel}>{t('profile.lastSeen', 'Last Seen')}:</ThemedText>
          <ThemedText style={styles.infoValue}>{user?.metadata?.lastSignInTime}</ThemedText>
        </View>
        
        <View style={styles.infoRow}>
          <ThemedText type="defaultSemiBold" style={styles.infoLabel}>{t('profile.created', 'Created')}:</ThemedText>
          <ThemedText style={styles.infoValue}>{user?.metadata?.creationTime}</ThemedText>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#E53E3E', '#C53030', '#9B2C2C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <ThemedText style={styles.buttonText}>{t('common.logout', 'Logout')}</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 12,
  },
  profileIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f0ebff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    color: '#8B5CF6',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    width: 100,
    color: '#8B5CF6',
  },
  infoValue: {
    flex: 1,
    color: '#000',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButton: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 24,
    padding: 8,
  },
});

export default ProfileScreen;
