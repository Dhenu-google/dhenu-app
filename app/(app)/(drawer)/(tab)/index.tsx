import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image, Text as RNText, Modal, TextInput, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
import { Text, Appbar, Divider, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSession } from '@/context';
import { Ionicons } from '@expo/vector-icons';
import TabChatbotButton from '@/components/TabChatbotButton';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import MooAIChat from '@/app/(app)/persona-ai';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { user } = useSession();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { text: "Welcome to Moo AI! 🐄 Ask me about Indian cow breeds.\n\n1️⃣ Learn about a breed's origin, history & socio-economic benefits.\n2️⃣ Don't know a breed? I can list all or filter by region.\n3️⃣ No cruelty-related queries allowed.", sender: 'bot' },
  ]);
  
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
            {t('dashboard.title', 'Dashboard')}
          </ThemedText>
          <View style={styles.welcomeTextContainer}>
            <ThemedText style={styles.welcomeLabel}>{t('common.welcome', 'Welcome')}, </ThemedText>
            <ThemedText style={styles.nameText}>{user?.displayName || t('common.user', 'User')}</ThemedText>
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
            <LinearGradient
              colors={['#8D6E63', '#795548', '#5D4037']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="chatbubbles-outline" size={30} color="#FFF" />
                </View>
                <Text style={styles.cardTitle}>{t('explore.forum', 'Forum')}</Text>
                <Text style={styles.cardDescription}>{t('explore.forumDescription', 'Know about others opinions, and share yours!')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Report Stray Cow Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('report')}
          >
            <LinearGradient
              colors={['#8D6E63', '#795548', '#5D4037']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="alert-circle-outline" size={30} color="#FFF" />
                </View>
                <Text style={styles.cardTitle}>{t('explore.reportStrayCow', 'Report stray cow')}</Text>
                <Text style={styles.cardDescription}>{t('explore.helpHelpless', 'Help the helpless')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Marketplace Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('marketplace')}
          >
            <LinearGradient
              colors={['#8D6E63', '#795548', '#5D4037']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="basket-outline" size={30} color="#FFF" />
                </View>
                <Text style={styles.cardTitle}>{t('marketplace.title', 'Shop')}</Text>
                <Text style={styles.cardDescription}>{t('marketplace.description', 'Find Dairy products, services near you')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Network Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('network')}
          >
            <LinearGradient
              colors={['#8D6E63', '#795548', '#5D4037']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="map-outline" size={30} color="#FFF" />
                </View>
                <Text style={styles.cardTitle}>{t('explore.network', 'Network')}</Text>
                <Text style={styles.cardDescription}>{t('explore.networkDescription', 'Find nearby cow farmers, gaushalas, and NGOs')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Chatbot Button */}
      <View style={styles.chatButtonContainer}>
        <LinearGradient
          colors={['#a67b6d', '#5D4037']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        >
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => setIsChatVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Image 
                source={require('../../../../assets/images/AI.png')}
                style={styles.aiLogo}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>{t('explore.askMooAI', 'Ask EMoo AI')}</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* MooAIChat Modal */}
      <Modal
        visible={isChatVisible}
        animationType="slide"
        onRequestClose={() => setIsChatVisible(false)}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsChatVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Moo AI</Text>
            <View style={{ width: 24 }} />
          </View>
          <MooAIChat messages={messages} setMessages={setMessages} isOpen={isChatVisible} />
        </SafeAreaView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faebd7',
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
    color: '#5D4037',
  },
  welcomeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeLabel: {
    fontSize: 18,
    color: '#5D4037',
  },
  nameText: {
    fontSize: 18,
    color: '#5D4037',
    fontWeight: '600',
  },
  exclamation: {
    fontSize: 18,
    color: '#5D4037',
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
  },
  menuGradient: {
    width: '100%',
    height: '100%',
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
  chatButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  gradientBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    padding: 3.25, // Border thickness
    shadowColor: 'rgba(93, 64, 55, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  chatButton: {
    flex: 1,
    borderRadius: 27,
    backgroundColor: '#faebd7',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: '100%',
  },
  aiLogo: {
    width: 68,
    height: 68,
    marginRight: 8,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
    color: '#5D4037',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 238, 238, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
  },
});

