import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { languageNames, setLanguage } from '@/lib/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageSwitcherProps {
  buttonStyle?: any;
}

/**
 * Language Switcher component that displays a button which opens a language selection modal
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ buttonStyle }) => {
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  
  // Handle language change
  const changeLanguage = useCallback(async (langCode: string) => {
    try {
      setIsChangingLanguage(true);
      
      // Clear any existing language data to prevent conflicts
      const LANGUAGE_STORAGE_KEY = '@app_language';
      await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
      
      // Add a small delay to ensure storage is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Set the new language
      await setLanguage(langCode);
      
      // Force a re-render after language change
      i18n.reloadResources();
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChangingLanguage(false);
      setModalVisible(false);
    }
  }, [i18n]);
  
  return (
    <View>
      {/* Language Button */}
      <TouchableOpacity
        style={[styles.button, buttonStyle]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="language" size={22} color="#333" />
        <Text style={styles.buttonText}>{t('common.language', 'Language')}</Text>
      </TouchableOpacity>
      
      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('language.select', 'Select Language')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                disabled={isChangingLanguage}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {isChangingLanguage ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
              </View>
            ) : (
              <ScrollView style={styles.languageList}>
                {Object.entries(languageNames).map(([langCode, langName]) => (
                  <TouchableOpacity
                    key={langCode}
                    style={[
                      styles.languageItem,
                      i18n.language === langCode && styles.selectedLanguage,
                    ]}
                    onPress={() => changeLanguage(langCode)}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        i18n.language === langCode && styles.selectedLanguageText,
                      ]}
                    >
                      {langName}
                    </Text>
                    {i18n.language === langCode && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  buttonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  languageList: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguage: {
    backgroundColor: '#f0f8ff',
  },
  selectedLanguageText: {
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default LanguageSwitcher; 