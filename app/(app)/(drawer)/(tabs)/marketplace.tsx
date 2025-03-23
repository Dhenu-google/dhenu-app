import React, { useContext } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ProductsContext, Product } from "@/app/(app)/context/ProductsContext";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";

export default function MarketplaceScreen() {
  const { products, loading } = useContext(ProductsContext);

  const handleProductPress = (product: Product) => {
    // Navigate to product details and pass the product data as params
    router.push({
      pathname: "/(app)/product-details",
      params: { product: JSON.stringify(product) },
    });
  };

  // Render loading state
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Marketplace</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Marketplace</ThemedText>
      </View>
      
      <View style={styles.contentContainer}>
        <ThemedText type="subtitle" style={styles.subtitle}>MY LISTED PRODUCTS</ThemedText>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.productCard}
              onPress={() => handleProductPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.productInfo}>
                <ThemedText style={styles.productName}>{item.name}</ThemedText>
                <ThemedText style={styles.category}>{item.category}</ThemedText>
                
                {item.location && (
                  <View style={styles.locationContainer}>
                    <Ionicons name="location" size={14} color="#333" />
                    <ThemedText style={styles.locationText}>{item.location}</ThemedText>
                  </View>
                )}
              </View>
              
              <View style={styles.enquiryContainer}>
                <ThemedText style={styles.enquiryCount}>{item.enquiries}</ThemedText>
                <ThemedText style={styles.enquiryLabel}>Enquiries</ThemedText>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={60} color="#ccc" />
              <ThemedText style={styles.emptyText}>No products listed yet.</ThemedText>
              <ThemedText style={styles.emptySubtext}>Add your first product to the marketplace</ThemedText>
            </View>
          }
        />

        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => router.push("/(app)/add-product")}
        >
          <LinearGradient
            colors={['#4C6EF5', '#3B5BDB', '#364FC7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <ThemedText style={styles.addButtonText}>ADD NEW PRODUCT</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#8B5CF6', // Lavender color
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  subtitle: { 
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    fontWeight: '500'
  },
  listContainer: {
    paddingBottom: 16,
  },
  productCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: { 
    fontSize: 16, 
    fontWeight: "600",
    marginBottom: 4,
  },
  category: { 
    fontSize: 14, 
    color: "#333",
    marginBottom: 8, 
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 4,
  },
  enquiryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 110, 245, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  enquiryCount: { 
    fontSize: 18, 
    color: "#4C6EF5", 
    fontWeight: "bold" 
  },
  enquiryLabel: {
    fontSize: 12,
    color: "#4C6EF5",
  },
  addButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  addButtonText: { 
    color: "#fff", 
    fontSize: 15, 
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: { 
    textAlign: "center", 
    marginTop: 16, 
    fontSize: 16,
    fontWeight: '500',
    color: "#333" 
  },
  emptySubtext: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    color: "#333"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  }
});
