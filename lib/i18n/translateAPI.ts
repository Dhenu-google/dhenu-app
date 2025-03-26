import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './index';

// Google Cloud Translation API endpoint
const API_URL = 'https://translation.googleapis.com/language/translate/v2';
// This should be stored in a secure environment variable
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || '';

// Cache storage key prefix
const TRANSLATION_CACHE_PREFIX = '@translation_cache_';

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

interface CacheItem {
  text: string;
  timestamp: number;
}

/**
 * Get cached translation if available and not expired
 * @param text Text to translate
 * @param targetLang Target language code
 * @returns Cached translation or null if not found
 */
const getCachedTranslation = async (
  text: string,
  targetLang: string
): Promise<string | null> => {
  try {
    const cacheKey = `${TRANSLATION_CACHE_PREFIX}${targetLang}_${text.slice(0, 50)}`;
    const cachedItem = await AsyncStorage.getItem(cacheKey);
    
    if (cachedItem) {
      const parsedCache: CacheItem = JSON.parse(cachedItem);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - parsedCache.timestamp < CACHE_EXPIRATION) {
        return parsedCache.text;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error accessing translation cache:', error);
    return null;
  }
};

/**
 * Store translation in cache
 * @param text Original text
 * @param translatedText Translated text
 * @param targetLang Target language code
 */
const cacheTranslation = async (
  text: string,
  translatedText: string,
  targetLang: string
): Promise<void> => {
  try {
    const cacheKey = `${TRANSLATION_CACHE_PREFIX}${targetLang}_${text.slice(0, 50)}`;
    const cacheItem: CacheItem = {
      text: translatedText,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error caching translation:', error);
  }
};

/**
 * Translate text using Google Cloud Translation API
 * @param text Text to translate
 * @param targetLang Target language code (e.g., 'hi', 'kn')
 * @param sourceLang Source language code (optional, defaults to 'en')
 * @returns Translated text or original text if translation fails
 */
export const translateText = async (
  text: string,
  targetLang?: string,
  sourceLang: string = 'en'
): Promise<string> => {
  if (!text) return text;
  
  try {
    // If no target language specified, use the current i18n language
    const currentLang = targetLang || (i18n.language || 'en');
    
    // If text is empty or target language is English or same as source, return original text
    if (currentLang === 'en' || currentLang === sourceLang) {
      return text;
    }
    
    // Check if we have a cached translation
    const cachedTranslation = await getCachedTranslation(text, currentLang);
    if (cachedTranslation) {
      return cachedTranslation;
    }
    
    // If no API key is available, return original text
    if (!API_KEY) {
      console.warn('Google Translate API key not found');
      return text;
    }
    
    // Call the Google Cloud Translation API
    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      {
        q: text,
        target: currentLang,
        source: sourceLang,
        format: 'text',
      }
    );
    
    // Get the translated text from the response
    const translatedText = response.data.data.translations[0].translatedText;
    
    // Cache the translation
    await cacheTranslation(text, translatedText, currentLang);
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
};

/**
 * Batch translate multiple texts at once
 * @param texts Array of texts to translate
 * @param targetLang Target language code
 * @param sourceLang Source language code (optional, defaults to 'en')
 * @returns Array of translated texts
 */
export const batchTranslate = async (
  texts: string[],
  targetLang?: string,
  sourceLang: string = 'en'
): Promise<string[]> => {
  if (!texts || texts.length === 0) return texts;
  
  try {
    // If no target language specified, use the current i18n language
    const currentLang = targetLang || (i18n.language || 'en');
    
    // If target language is English or same as source, return original texts
    if (currentLang === 'en' || currentLang === sourceLang) {
      return texts;
    }
    
    // Filter out empty texts
    const validTexts = texts.filter(text => !!text);
    
    // If no valid texts, return original array
    if (validTexts.length === 0) {
      return texts;
    }
    
    // If no API key is available, return original texts
    if (!API_KEY) {
      console.warn('Google Translate API key not found');
      return texts;
    }
    
    // Call the Google Cloud Translation API
    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      {
        q: validTexts,
        target: currentLang,
        source: sourceLang,
        format: 'text',
      }
    );
    
    // Get the translated texts from the response
    const translatedTexts = response.data.data.translations.map(
      (t: any) => t.translatedText
    );
    
    // Cache each translation
    for (let i = 0; i < validTexts.length; i++) {
      await cacheTranslation(validTexts[i], translatedTexts[i], currentLang);
    }
    
    // Replace the original texts with translations
    return texts.map(text => {
      if (!text) return text;
      const index = validTexts.indexOf(text);
      return index >= 0 ? translatedTexts[index] : text;
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts; // Return original texts if translation fails
  }
}; 