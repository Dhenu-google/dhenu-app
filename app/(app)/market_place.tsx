import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Text,
  Button,
  Alert,
} from "react-native";
import { collection, getDocs, getFirestore, query, orderBy } from "firebase/firestore";
import { getAuth, User } from "firebase/auth"; // Import Firebase Auth
import app from "@/lib/firebase-config";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook
import { DB_API_URL } from "@/config";

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  location?: string;
  enquiries: number;
  createdAt: any;
  userId: string; // Add userId field
}

export default function MarketPlace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  interface Seller {
    displayName: string;
    email: string;
  }
  
  const [seller, setSeller] = useState<Seller | null>(null); // Use custom Seller type
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation(); // Use navigation hook for back navigation

  // Fetch all products from Firestore
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(productsQuery);
      const fetchedProducts: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Product, "id">;
        fetchedProducts.push({
          id: doc.id,
          ...data,
        });
      });

      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch seller information from API
  const fetchSeller = async (userId: string) => {
    try {
      // Make a GET request to the API with the seller's UID
      const response = await fetch(`${DB_API_URL}/get_user/${userId}`);

      if (response.ok) {
        const sellerData = await response.json();
        setSeller({
          displayName: sellerData.name,
          email: sellerData.email,
        }); // Set the seller details
      } else {
        const errorData = await response.json();
        console.error("Error fetching seller:", errorData.error || "Unknown error");
        setSeller(null);
      }
    } catch (error) {
      console.error("Error fetching seller from API:", error);
      setSeller(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle product click
  const handleProductPress = async (product: Product) => {
    console.log("Selected Product:", product); // Debugging
    console.log("User ID:", product.userId); // Debugging

    if (!product.userId) {
      Alert.alert("Error", "Seller information is not available for this product.");
      return;
    }

    setSelectedProduct(product);
    await fetchSeller(product.userId); // Fetch seller information using the API
    setModalVisible(true); // Open modal
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
    setSeller(null);
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  // Render product item
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleProductPress(item)}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        {item.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#4C6EF5" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#4C6EF5" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Marketplace</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
      />

      {/* Product Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Back Button in Modal */}
            <TouchableOpacity style={styles.backButton} onPress={closeModal}>
              <Ionicons name="arrow-back" size={24} color="#4C6EF5" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            {selectedProduct && (
              <>
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                <Text style={styles.modalCategory}>Category: {selectedProduct.category}</Text>
                {selectedProduct.description && (
                  <Text style={styles.modalDescription}>
                    Description: {selectedProduct.description}
                  </Text>
                )}
                {selectedProduct.location && (
                  <Text style={styles.modalLocation}>Location: {selectedProduct.location}</Text>
                )}
                <Text style={styles.modalEnquiries}>
                  Enquiries: {selectedProduct.enquiries}
                </Text>
              </>
            )}

            {seller ? (
              <>
                <Text style={styles.modalSellerTitle}>Seller Information</Text>
                <Text style={styles.modalSellerInfo}>Name: {seller.displayName || "N/A"}</Text>
                <Text style={styles.modalSellerInfo}>Email: {seller.email || "N/A"}</Text>
              </>
            ) : (
              <Text style={styles.modalSellerInfo}>Loading seller information...</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#4C6EF5",
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#222",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 16,
  },
  productCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#111",
  },
  category: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 13,
    color: "#333",
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalCategory: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 10,
    color: "#555",
  },
  modalLocation: {
    fontSize: 14,
    marginBottom: 10,
    color: "#555",
  },
  modalEnquiries: {
    fontSize: 14,
    marginBottom: 10,
    color: "#555",
  },
  modalSellerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  modalSellerInfo: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
  },
});