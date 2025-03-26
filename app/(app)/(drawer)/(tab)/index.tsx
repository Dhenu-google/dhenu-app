import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image, Text as RNText, Modal, TextInput, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
import { Text, Appbar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSession } from '@/context';
import { Ionicons } from '@expo/vector-icons';
import TabChatbotButton from '@/components/TabChatbotButton';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  const { user } = useSession();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  
  // Handle pull-to-refresh action
  const onRefresh = () => {
    setRefreshing(true);
    
    // Simulate a delay for refreshing
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Handle navigation to profile
  const navigateToProfile = () => {
    router.push({
      pathname: '/(app)/(drawer)/profile',
      params: { source: 'tab' }
    });
  };

  // Function to navigate to different sections
  const navigateToSection = (section: string) => {
    console.log(`Navigating to ${section}`);
    if (section === 'forum') {
      router.push('/(app)/forum');
    } else if (section === 'report') {
      // This route may need to be created
      router.push('/(app)/stray-cows');
    } else if (section === 'marketplace') {
      // Navigate to product listing page
      router.push('/(app)/market_place');
    } else if (section === 'network') {
      // navigate to network page
      router.push('/network');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Dashboard Header */}
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.dashboardTitle}>
            Dashboard
          </ThemedText>
          <View style={styles.welcomeTextContainer}>
            <ThemedText style={styles.welcomeLabel}>Welcome, </ThemedText>
            <ThemedText style={styles.nameText}>{user?.displayName || "User"}</ThemedText>
            <ThemedText style={styles.exclamation}>!</ThemedText>
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {/* Forum Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('forum')}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="chatbubbles-outline" size={30} color="#FFF" />
              </View>
              <Text style={styles.cardTitle}>Forum</Text>
              <Text style={styles.cardDescription}>Know about others opinions, and share yours!</Text>
            </View>
          </TouchableOpacity>

          {/* Report Stray Cow Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('report')}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="alert-circle-outline" size={30} color="#FFF" />
              </View>
              <Text style={styles.cardTitle}>Report stray cow</Text>
              <Text style={styles.cardDescription}>Help the helpless</Text>
            </View>
          </TouchableOpacity>

          {/* Marketplace Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('marketplace')}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="basket-outline" size={30} color="#FFF" />
              </View>
              <Text style={styles.cardTitle}>Marketplace</Text>
              <Text style={styles.cardDescription}>Find Dairy products, services near you</Text>
            </View>
          </TouchableOpacity>

          {/* DhenuAI Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('dhenuai')}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="map-outline" size={30} color="#FFF" />
              </View>
              <Text style={styles.cardTitle}>Network</Text>
              <Text style={styles.cardDescription}>Find Cows near you</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Tab Chatbot Button */}
      <TabChatbotButton />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'flex-start',
  },
  dashboardTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4C6EF5',
  },
  welcomeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeLabel: {
    fontSize: 18,
    color: '#333',
  },
  nameText: {
    fontSize: 18,
    color: '#9254de',
    fontWeight: '600',
  },
  exclamation: {
    fontSize: 18,
    color: '#333',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    width: '100%',
  },
  menuCard: {
    width: '48%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#4070F4',
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
    height: '100%',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#FFFFFF',
  },
});

