import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Modal, ScrollView, Linking, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";

interface Enquiry {
  name: string;
  contact: string;
  message: string;
  createdAt: string;
}

export default function ProductDetailsScreen() {
  const { t } = useTranslation();
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
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const url = `tel:${cleanNumber}`;
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          t('common.error', 'Error'),
          t('productDetails.dialerError', 'Unable to open phone dialer. Please check your device settings.')
        );
      }
    } catch (error) {
      console.error('Error opening phone dialer:', error);
      Alert.alert(t('common.error', 'Error'), t('productDetails.dialerError', 'Failed to open phone dialer'));
    }
  };

  if (!productData) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#5D4037" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>{t('productDetails.title', 'Product Details')}</ThemedText>
          <View style={{width: 24}} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#5D4037" />
          <ThemedText style={styles.errorText}>{t('productDetails.noData', 'No product data available.')}</ThemedText>
          <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
            <ThemedText style={styles.returnButtonText}>{t('productDetails.returnToMarketplace', 'Return to Marketplace')}</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#5D4037" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>{t('productDetails.title', 'Product Details')}</ThemedText>
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
          <ThemedText style={styles.sectionTitle}>{t('productDetails.description', 'Description')}</ThemedText>
          <ThemedText style={styles.descriptionText}>
            {productData.description || t('productDetails.noDescription', 'No description provided')}
          </ThemedText>
        </View>
        
        {productData.location && (
          <View style={styles.detailSection}>
            <ThemedText style={styles.sectionTitle}>{t('productDetails.location', 'Location')}</ThemedText>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#5D4037" />
              <ThemedText style={styles.locationText}>{productData.location}</ThemedText>
            </View>
          </View>
        )}
        
        <View style={styles.detailSection}>
          <ThemedText style={styles.sectionTitle}>{t('productDetails.enquiries', 'Enquiries')}</ThemedText>
          <View style={styles.enquiryContainer}>
            <ThemedText style={styles.enquiryCount}>{productData.enquiries}</ThemedText>
            <ThemedText style={styles.enquiryText}>{t('productDetails.interest', 'people have shown interest')}</ThemedText>
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
                  <Ionicons name="chevron-forward" size={20} color="#5D4037" />
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
                <Ionicons name="close" size={24} color="#5D4037" />
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>{t('productDetails.enquiryDetails', 'Enquiry Details')}</ThemedText>
            </View>

            {selectedEnquiry && (
              <View style={styles.modalBody}>
                <View style={styles.modalDetailRow}>
                  <ThemedText style={styles.modalLabel}>{t('productDetails.name', 'Name:')}</ThemedText>
                  <ThemedText style={styles.modalValue}>{selectedEnquiry.name}</ThemedText>
                </View>
                <View style={styles.modalDetailRow}>
                  <ThemedText style={styles.modalLabel}>{t('productDetails.contact', 'Contact:')}</ThemedText>
                  <TouchableOpacity 
                    onPress={() => handleCallPress(selectedEnquiry.contact)}
                    style={styles.contactButton}
                  >
                    <ThemedText style={styles.contactValue}>{selectedEnquiry.contact}</ThemedText>
                    <Ionicons name="call" size={16} color="#5D4037" style={styles.callIcon} />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalDetailRow}>
                  <ThemedText style={styles.modalLabel}>{t('productDetails.message', 'Message:')}</ThemedText>
                  <ThemedText style={styles.modalMessage}>{selectedEnquiry.message}</ThemedText>
                </View>
                <View style={styles.modalDetailRow}>
                  <ThemedText style={styles.modalLabel}>{t('productDetails.date', 'Date:')}</ThemedText>
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
  productHeader: {
    marginBottom: 24,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    marginBottom: 8,
    color: '#5D4037',
  },
  categoryChip: {
    backgroundColor: 'rgba(93, 64, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#5D4037',
    fontSize: 14,
    fontWeight: '500',
  },
  detailSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#5D4037',
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
    color: '#5D4037',
  },
  enquiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(93, 64, 55, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  enquiryCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D4037',
    marginRight: 8,
  },
  enquiryText: {
    fontSize: 16,
    color: '#5D4037',
  },
  enquiryList: {
    marginTop: 8,
  },
  enquiryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(93, 64, 55, 0.1)',
  },
  enquiryButtonContent: {
    flex: 1,
  },
  enquiryButtonName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5D4037',
    marginBottom: 4,
  },
  enquiryButtonDate: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#5D4037',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4037',
    textAlign: 'center',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalDetailRow: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5D4037',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactValue: {
    fontSize: 16,
    color: '#5D4037',
    marginRight: 8,
  },
  callIcon: {
    marginLeft: 4,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#5D4037',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  returnButton: {
    backgroundColor: '#5D4037',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 