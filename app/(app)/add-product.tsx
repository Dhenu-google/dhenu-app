import React, { useState, useContext } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ProductsContext } from "@/app/(app)/context/ProductsContext";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function AddProductScreen() {
  const { addProduct } = useContext(ProductsContext);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const handleListProduct = () => {
    if (productName && category) {
      addProduct({ name: productName, category, description, location });
      router.back(); // Navigate back to the Marketplace
    } else {
      alert("Please fill in product name and category.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>New Product</ThemedText>
        <View style={{width: 24}} />
      </View>
      
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <ThemedText style={styles.label}>Product Name*</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            placeholderTextColor="#999"
            value={productName}
            onChangeText={setProductName}
          />
        </View>
        
        <View style={styles.inputSection}>
          <ThemedText style={styles.label}>Category*</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter category (e.g., Dairy, Feed)"
            placeholderTextColor="#999"
            value={category}
            onChangeText={setCategory}
          />
        </View>
        
        <View style={styles.inputSection}>
          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter product description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>
        
        <View style={styles.inputSection}>
          <ThemedText style={styles.label}>Location</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Where is this product available?"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
          />
        </View>
        
        <ThemedText style={styles.requiredText}>* Required fields</ThemedText>
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleListProduct}
        >
          <LinearGradient
            colors={['#4C6EF5', '#3B5BDB', '#364FC7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <ThemedText style={styles.addButtonText}>LIST PRODUCT</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
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
    color: '#999',
    marginTop: 8,
    marginBottom: 24,
  },
  addButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '600',
  },
}); 