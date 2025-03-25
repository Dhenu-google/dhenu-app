import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Modal, ScrollView, Linking, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

interface Enquiry {
  name: string;
  contact: string;
  message: string;
  createdAt: string;
}

export default function ProductDetailsScreen() {
  const { product } = useLocalSearchParams<{ product: string }>();
  const productData = product ? JSON.parse(product) : null;
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleEnquiryPress = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEnquiry(null);
  };

  const handleCallPress = async (phoneNumber: string) => {
    try {
      // Remove any non-numeric characters from the phone number
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const url = `tel:${cleanNumber}`;
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          'Unable to open phone dialer. Please check your device settings.'
        );
      }
    } catch (error) {
      console.error('Error opening phone dialer:', error);
      Alert.alert('Error', 'Failed to open phone dialer');
    }
  };

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
      
      <ScrollView style={styles.contentContainer}>
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
          
          {productData.enquiryList && productData.enquiryList.length > 0 && (
            <View style={styles.enquiryList}>
              {productData.enquiryList.map((enquiry: Enquiry, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.enquiryButton}
                  onPress={() => handleEnquiryPress(enquiry)}
                >
                  <View style={styles.enquiryButtonContent}>
                    <ThemedText style={styles.enquiryButtonName}>{enquiry.name}</ThemedText>
                    <ThemedText style={styles.enquiryButtonDate}>
                      {new Date(enquiry.createdAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Enquiry Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>Enquiry Details</ThemedText>
            </View>

            {selectedEnquiry && (
              <View style={styles.modalBody}>
                <View style={styles.modalDetailRow}>
                  <ThemedText style={styles.modalLabel}>Name:</ThemedText>
                  <ThemedText style={styles.modalValue}>{selectedEnquiry.name}</ThemedText>
                </View>
                <View style={styles.modalDetailRow}>
                  <ThemedText style={styles.modalLabel}>Contact:</ThemedText>
                  <TouchableOpacity 
                    onPress={() => handleCallPress(selectedEnquiry.contact)}
                    style={styles.contactButton}
                  >
                    <ThemedText style={styles.contactValue}>{selectedEnquiry.contact}</ThemedText>
                    <Ionicons name="call" size={16} color="#4C6EF5" style={styles.callIcon} />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalDetailRow}>
                  <ThemedText style={styles.modalLabel}>Message:</ThemedText>
                  <ThemedText style={styles.modalMessage}>{selectedEnquiry.message}</ThemedText>
                </View>
                <View style={styles.modalDetailRow}>
                  <ThemedText style={styles.modalLabel}>Date:</ThemedText>
                  <ThemedText style={styles.modalValue}>
                    {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </ThemedText>
                </View>
              </View>
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
  enquiryList: {
    marginTop: 16,
  },
  enquiryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  enquiryButtonContent: {
    flex: 1,
  },
  enquiryButtonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  enquiryButtonDate: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    marginTop: 16,
  },
  modalDetailRow: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#4C6EF5',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  callIcon: {
    marginLeft: 8,
  },
}); 