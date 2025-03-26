import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import language resources
import en from './translations/en.json';
import hi from './translations/hi.json';
import kn from './translations/kn.json';
import mr from './translations/mr.json';

const LANGUAGE_STORAGE_KEY = '@app_language';

// The resources object containing all the translations
const resources = {
  en: { translation: en },
  hi: { translation: hi },
  kn: { translation: kn },
  mr: { translation: mr }
};

// Language names for display in the UI
export const languageNames = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  kn: 'ಕನ್ನಡ (Kannada)',
  mr: 'मराठी (Marathi)'
};

// Get device language or fall back to English
const getDeviceLanguage = () => {
  try {
    // Get the locale from expo-localization
    const locale = Localization.locale || 'en';
    // Split to get just the language code (e.g., 'en-US' -> 'en')
    const deviceLang = locale.split('-')[0];
    
    // Only return if it's one of our supported languages
    if (['en', 'hi', 'kn', 'mr'].includes(deviceLang)) {
      return deviceLang;
    }
  } catch (error) {
    console.warn('Could not detect device language, defaulting to English:', error);
  }
  
  return 'en'; // Default to English
};

// Get stored language preference or device language
export const getInitialLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    // If the stored language is Bengali, reset to English
    if (storedLanguage === 'bn') {
      return 'en';
    }
    return storedLanguage || getDeviceLanguage();
  } catch (error) {
    console.error('Error getting stored language:', error);
    return 'en';
  }
};

// Set language and store in AsyncStorage
export const setLanguage = async (languageCode: string) => {
  try {
    // Remove the language key
    await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Then set the new language
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    
    // Change the language in i18n
    await i18n.changeLanguage(languageCode);
    
    return true;
  } catch (error) {
    console.error('Error setting language:', error);
    return false;
  }
};

// Helper function to get translations directly
export const getTranslation = (key: string, defaultValue: string = ''): string => {
  try {
    const parts = key.split('.');
    let translation: any = i18n.getResourceBundle(i18n.language, 'translation');
    
    for (const part of parts) {
      if (!translation || !translation[part]) return defaultValue;
      translation = translation[part];
    }
    
    return translation || defaultValue;
  } catch (error) {
    console.error('Translation error:', error);
    return defaultValue;
  }
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'en', // Default language (will be updated async)
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    react: {
      useSuspense: false, // Disable suspense which can cause issues with React Native
    },
    // Add debug mode to help diagnose issues
    debug: __DEV__
  });

// Try to load the stored language
getInitialLanguage().then(language => {
  i18n.changeLanguage(language);
}).catch(() => {
  // If there's an error, ensure we use English
  i18n.changeLanguage('en');
});

export default i18n; 