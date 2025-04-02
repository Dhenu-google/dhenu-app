import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

/**
 * This is a simple redirect screen that navigates to the forum
 * This approach avoids routing issues between app groups
 */
export default function ForumRedirect() {
  useEffect(() => {
    // Navigate to forum with a slight delay
    const timer = setTimeout(() => {
      router.replace('/(app)/forum');
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#5D4037" />
      <ThemedText style={styles.text}>Opening Forum...</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faebd7',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  }
}); 