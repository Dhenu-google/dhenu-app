import React, { useContext, useState } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from "react-native";
import { router } from "expo-router";
import { ProductsContext, Product } from "@/app/(app)/context/ProductsContext";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

export default function MarketplaceScreen() {
  const { t } = useTranslation();
  const { products, loading, deleteProduct } = useContext(ProductsContext);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setShowOptions(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    Alert.alert(
      t('marketplace.deleteTitle', 'Delete Product'),
      t('marketplace.deleteConfirm', 'Are you sure you want to delete this product?'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(selectedProduct.id);
              setShowOptions(false);
            } catch (error) {
              Alert.alert(
                t('common.error', 'Error'),
                t('marketplace.deleteError', 'Failed to delete product. Please try again.')
              );
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = () => {
    if (selectedProduct) {
      router.push({
        pathname: "/(app)/product-details",
        params: { product: JSON.stringify(selectedProduct) },
      });
    }
    setShowOptions(false);
  };

  // Render loading state
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>{t('marketplace.title', 'Marketplace')}</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D4037" />
          <ThemedText style={styles.loadingText}>{t('common.loading', 'Loading products...')}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>{t('marketplace.title', 'Marketplace')}</ThemedText>
      </View>
      
      <View style={styles.contentContainer}>
        <ThemedText type="subtitle" style={styles.subtitle}>{t('marketplace.myListings', 'MY LISTED PRODUCTS')}</ThemedText>

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
                <ThemedText style={styles.enquiryLabel}>{t('marketplace.listings', 'Enquiries')}</ThemedText>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={60} color="#ccc" />
              <ThemedText style={styles.emptyText}>{t('marketplace.noListings', 'No products listed yet.')}</ThemedText>
              <ThemedText style={styles.emptySubtext}>{t('marketplace.postListing', 'Add your first product to the marketplace')}</ThemedText>
            </View>
          }
        />

        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => router.push("/(app)/add-product")}
        >
          <View style={styles.gradientButton}>
            <Ionicons name="add" size={20} color="#fff" />
            <ThemedText style={styles.addButtonText}>{t('marketplace.postListing', 'ADD NEW PRODUCT')}</ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleViewDetails}
            >
              <Ionicons name="eye-outline" size={24} color="#5D4037" />
              <ThemedText style={styles.modalOptionText}>{t('marketplace.viewDetails', 'View Details')}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalOption, styles.deleteOption]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="#dc2626" />
              <ThemedText style={[styles.modalOptionText, styles.deleteText]}>{t('marketplace.delete', 'Delete Product')}</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#faebd7',
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
    color: '#5D4037',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  subtitle: { 
    fontSize: 14,
    color: '#5D4037',
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
    color: '#5D4037',
  },
  category: { 
    fontSize: 14, 
    color: "#5D4037",
    marginBottom: 8, 
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: '#5D4037',
    marginLeft: 4,
  },
  enquiryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(93, 64, 55, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  enquiryCount: { 
    fontSize: 18, 
    color: "#5D4037", 
    fontWeight: "bold" 
  },
  enquiryLabel: {
    fontSize: 12,
    color: "#5D4037",
  },
  addButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: '#5D4037',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#5D4037',
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
    color: "#5D4037" 
  },
  emptySubtext: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    color: "#5D4037"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5D4037',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#5D4037',
  },
  deleteOption: {
    marginTop: 8,
  },
  deleteText: {
    color: '#dc2626',
  },
});
