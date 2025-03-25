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
  TextInput,
  ScrollView,
} from "react-native";
import { collection, getDocs, getFirestore, query, orderBy, doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { getAuth, User } from "firebase/auth"; // Import Firebase Auth
import app from "@/lib/firebase-config";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook
import { DB_API_URL } from "@/config";
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

interface Enquiry {
  name: string;
  contact: string;
  message: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  location?: string;
  enquiries: number;
  createdAt: any;
  userId: string;
  enquiryList?: Enquiry[]; // Add this field
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
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    contact: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleEnquirySubmit = async () => {
    if (!selectedProduct || !seller) return;

    if (!enquiryForm.name.trim() || !enquiryForm.contact.trim() || !enquiryForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const productRef = doc(db, "products", selectedProduct.id);
      const newEnquiry = {
        name: enquiryForm.name,
        contact: enquiryForm.contact,
        message: enquiryForm.message,
        createdAt: new Date().toISOString(),
      };

      // Update the product document with the new enquiry and increment the enquiries count
      await updateDoc(productRef, {
        enquiryList: arrayUnion(newEnquiry),
        enquiries: increment(1)
      });

      Alert.alert('Success', 'Your enquiry has been sent to the seller');
      setEnquiryForm({ name: '', contact: '', message: '' });
      
      // Refresh the products list to show updated enquiry count
      fetchProducts();
    } catch (error) {
      console.error('Error sending enquiry:', error);
      Alert.alert(
        'Error', 
        'Failed to send enquiry. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
      </ThemedView>
    );
  }

  // Render product item
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleProductPress(item)}>
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName}>{item.name}</ThemedText>
        <View style={styles.categoryChip}>
          <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
        </View>
        {item.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#4C6EF5" />
            <ThemedText style={styles.locationText}>{item.location}</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        <ThemedText style={styles.backButtonText}>Back</ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.title}>Marketplace</ThemedText>
      <View style={styles.separator} />
      <ThemedText style={styles.subheading}>Products</ThemedText>
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
              <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
              <ThemedText style={styles.backButtonText}>Back</ThemedText>
            </TouchableOpacity>

            {selectedProduct && (
              <>
                <ThemedText style={styles.modalTitle}>{selectedProduct.name}</ThemedText>
                <View style={styles.categoryChip}>
                  <ThemedText style={styles.categoryText}>{selectedProduct.category}</ThemedText>
                </View>
                {selectedProduct.description && (
                  <ThemedText style={styles.modalDescription}>
                    {selectedProduct.description}
                  </ThemedText>
                )}
                {selectedProduct.location && (
                  <View style={styles.locationContainer}>
                    <Ionicons name="location" size={16} color="#4C6EF5" />
                    <ThemedText style={styles.locationText}>{selectedProduct.location}</ThemedText>
                  </View>
                )}
                <View style={styles.enquiryContainer}>
                  <ThemedText style={styles.enquiryCount}>{selectedProduct.enquiries}</ThemedText>
                  <ThemedText style={styles.enquiryText}>people have shown interest</ThemedText>
                </View>
              </>
            )}

            {seller ? (
              <>
                <ThemedText style={styles.modalSellerTitle}>Seller Information</ThemedText>
                <ThemedText style={styles.modalSellerInfo}>Name: {seller.displayName || "N/A"}</ThemedText>
                <ThemedText style={styles.modalSellerInfo}>Email: {seller.email || "N/A"}</ThemedText>
                
                <View style={styles.enquiryForm}>
                  <ThemedText style={styles.enquiryTitle}>Send Enquiry</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor="#666"
                    value={enquiryForm.name}
                    onChangeText={(text) => setEnquiryForm(prev => ({ ...prev, name: text }))}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Contact Number"
                    placeholderTextColor="#666"
                    value={enquiryForm.contact}
                    onChangeText={(text) => setEnquiryForm(prev => ({ ...prev, contact: text }))}
                    keyboardType="phone-pad"
                  />
                  <TextInput
                    style={[styles.input, styles.messageInput]}
                    placeholder="Your Message"
                    placeholderTextColor="#666"
                    value={enquiryForm.message}
                    onChangeText={(text) => setEnquiryForm(prev => ({ ...prev, message: text }))}
                    multiline
                    numberOfLines={4}
                  />
                  <TouchableOpacity 
                    style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
                    onPress={handleEnquirySubmit}
                    disabled={isSubmitting}
                  >
                    <LinearGradient
                      colors={['#FF4B4B', '#FF0000']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      <ThemedText style={styles.sendButtonText}>
                        {isSubmitting ? 'Sending...' : 'Send Enquiry'}
                      </ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <ThemedText style={styles.modalSellerInfo}>Loading seller information...</ThemedText>
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
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
    color: "#8B5CF6",
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "left",
    color: "#8B5CF6",
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 12,
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
    borderRadius: 12,
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
    marginBottom: 8,
    color: "#111",
  },
  categoryChip: {
    backgroundColor: 'rgba(76, 110, 245, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    color: '#4C6EF5',
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
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
    borderRadius: 12,
    width: "90%",
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#222",
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 16,
  },
  modalSellerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#222",
  },
  modalSellerInfo: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
  },
  enquiryForm: {
    width: '100%',
    marginTop: 20,
  },
  enquiryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#222',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  gradientButton: {
    padding: 15,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  enquiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
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
});