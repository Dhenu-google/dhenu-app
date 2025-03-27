import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface DhenuHeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export default function DhenuHeader({ showBackButton = false, title }: DhenuHeaderProps) {
  const navigation = useNavigation();
  const pathname = usePathname();
  const { t } = useTranslation();
  
  // Check if we're in the drawer navigation
  const gotoprofile = () => {
    router.push('/(app)/(drawer)/profile');
  };
  
  const handleBackPress = () => {
    router.replace('/(app)');
  };
  
  const openDrawer = () => {
    // @ts-ignore - The type definitions are incomplete
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      {/* Left side - profile button */}
      <View style={styles.sideContainer}>
        <TouchableOpacity onPress={gotoprofile} style={styles.iconButton}>
          <Ionicons name="person" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Center - Logo */}
      <View style={styles.titleContainer}>
        <Image 
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Right side - Language switcher or screen title */}
      <View style={styles.sideContainer}>
        {title ? (
          <Text style={styles.subtitleText}>{title}</Text>
        ) : (
          /* Language Switcher Button */
          <LanguageSwitcher buttonStyle={styles.languageButton} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 0 : 8,
  },
  sideContainer: {
    width: 80,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: 120,
    height: 40,
  },
  languageButton: {
    height: 32,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
});
