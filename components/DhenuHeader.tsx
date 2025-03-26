import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';

interface DhenuHeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export default function DhenuHeader({ showBackButton = false, title }: DhenuHeaderProps) {
  const navigation = useNavigation();
  const pathname = usePathname();
  
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
      {/* Left side back button */}
      <TouchableOpacity onPress={gotoprofile} style={styles.iconButton}>
        <Ionicons name="person" size={24} color="#333" />
      </TouchableOpacity>
      
      {/* Center - Logo */}
      <View style={styles.titleContainer}>
        <Image 
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Right side - screen title */}
      {title ? (
        <Text style={styles.subtitleText}>{title}</Text>
      ) : (
        <View style={styles.iconButton} /> // Empty view for spacing
      )}
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
