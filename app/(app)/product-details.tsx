import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function ProductDetailsScreen() {
  const { product } = useLocalSearchParams<{ product: string }>();
  const productData = product ? JSON.parse(product) : null;

  if (!productData) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>Product Details</ThemedText>
          <View style={{width: 24}} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#f44336" />
          <ThemedText style={styles.errorText}>No product data available.</ThemedText>
          <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
            <ThemedText style={styles.returnButtonText}>Return to Marketplace</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>Product Details</ThemedText>
        <View style={{width: 24}} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.productHeader}>
          <ThemedText style={styles.title}>{productData.name}</ThemedText>
          <View style={styles.categoryChip}>
            <ThemedText style={styles.categoryText}>{productData.category}</ThemedText>
          </View>
        </View>
        
        <View style={styles.detailSection}>
          <ThemedText style={styles.sectionTitle}>Description</ThemedText>
          <ThemedText style={styles.descriptionText}>
            {productData.description || "No description provided"}
          </ThemedText>
        </View>
        
        {productData.location && (
          <View style={styles.detailSection}>
            <ThemedText style={styles.sectionTitle}>Location</ThemedText>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#4C6EF5" />
              <ThemedText style={styles.locationText}>{productData.location}</ThemedText>
            </View>
          </View>
        )}
        
        <View style={styles.detailSection}>
          <ThemedText style={styles.sectionTitle}>Enquiries</ThemedText>
          <View style={styles.enquiryContainer}>
            <ThemedText style={styles.enquiryCount}>{productData.enquiries}</ThemedText>
            <ThemedText style={styles.enquiryText}>people have shown interest</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  backButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  productHeader: {
    marginBottom: 24,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    marginBottom: 8 
  },
  categoryChip: {
    backgroundColor: 'rgba(76, 110, 245, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#4C6EF5',
    fontSize: 14,
    fontWeight: '500',
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  enquiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enquiryCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4C6EF5',
    marginRight: 8,
  },
  enquiryText: {
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  returnButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  returnButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}); 