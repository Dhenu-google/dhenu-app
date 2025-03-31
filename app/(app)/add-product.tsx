import React, { useState, useContext, useEffect } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ProductsContext, Product } from "@/app/(app)/context/ProductsContext";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";

export default function AddProductScreen() {
  const { t } = useTranslation();
  const { addProduct, editProduct } = useContext(ProductsContext);
  const { product } = useLocalSearchParams<{ product: string }>();
  const isEditing = !!product;
  const existingProduct = product ? JSON.parse(product) as Product : null;

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (existingProduct) {
      setProductName(existingProduct.name);
      setCategory(existingProduct.category);
      setDescription(existingProduct.description || "");
      setLocation(existingProduct.location || "");
    }
  }, [existingProduct]);

  const handleSubmit = async () => {
    if (!productName || !category) {
      Alert.alert(t('common.error', 'Error'), t('addProduct.requiredFields', 'Please fill in product name and category.'));
      return;
    }

    try {
      if (isEditing && existingProduct) {
        await editProduct(existingProduct.id, {
          name: productName,
          category,
          description,
          location,
        });
      } else {
        await addProduct({
          name: productName,
          category,
          description,
          location,
        });
      }
      router.back();
    } catch (error) {
      Alert.alert(
        t('common.error', 'Error'),
        t('addProduct.submitError', 'Failed to save product. Please try again.')
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#5D4037" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          {isEditing ? t('addProduct.editTitle', 'Edit Product') : t('addProduct.newTitle', 'New Product')}
        </ThemedText>
        <View style={{width: 24}} />
      </View>
      
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <ThemedText style={styles.label}>{t('addProduct.nameLabel', 'Product Name*')}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={t('addProduct.namePlaceholder', 'Enter product name')}
            placeholderTextColor="#777"
            value={productName}
            onChangeText={setProductName}
          />
        </View>
        
        <View style={styles.inputSection}>
          <ThemedText style={styles.label}>{t('addProduct.categoryLabel', 'Category*')}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={t('addProduct.categoryPlaceholder', 'Enter category (e.g., Dairy, Feed)')}
            placeholderTextColor="#777"
            value={category}
            onChangeText={setCategory}
          />
        </View>
        
        <View style={styles.inputSection}>
          <ThemedText style={styles.label}>{t('addProduct.descriptionLabel', 'Description')}</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('addProduct.descriptionPlaceholder', 'Enter product description')}
            placeholderTextColor="#777"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>
        
        <View style={styles.inputSection}>
          <ThemedText style={styles.label}>{t('addProduct.locationLabel', 'Location')}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={t('addProduct.locationPlaceholder', 'Where is this product available?')}
            placeholderTextColor="#777"
            value={location}
            onChangeText={setLocation}
          />
        </View>
        
        <ThemedText style={styles.requiredText}>{t('addProduct.requiredFields', '* Required fields')}</ThemedText>
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleSubmit}
        >
          <View style={styles.gradientButton}>
            <ThemedText style={styles.addButtonText}>
              {isEditing ? t('addProduct.updateButton', 'UPDATE PRODUCT') : t('addProduct.listButton', 'LIST PRODUCT')}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#faebd7',
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
    color: '#5D4037',
  },
  backButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#5D4037',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    minHeight: 100,
  },
  requiredText: {
    fontSize: 14,
    color: '#5D4037',
    marginTop: 8,
    marginBottom: 24,
  },
  addButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#5D4037',
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#5D4037',
  },
  addButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '600',
  },
}); 