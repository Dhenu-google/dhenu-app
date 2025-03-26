/**
 * Firebase configuration and initialization module.
 * This module handles the setup of Firebase services for the application.
 * @module
 */
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Firebase configuration object containing necessary credentials and endpoints
 * @type {Object}
 */
const firebaseConfig = {
  apiKey: "literal:FIREBASE_API_KEY",
  authDomain: "dhenu-452914.firebaseapp.com",
  projectId: "dhenu-452914",
  storageBucket: "dhenu-452914.firebasestorage.app",
  messagingSenderId: "72167339228",
  appId: "1:72167339228:android:6d76f5e1e44cb6cd6a7019",
};

// ============================================================================
// Firebase Initialization
// ============================================================================

/**
 * Initialize Firebase application instance
 * @type {FirebaseApp}
 */
const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase Authentication service with persistence
 * @type {Auth}
 */
let auth;

// Initialize auth with persistence for React Native
// Based on Firebase v11 documentation, we can use the main firebase/auth import
if (Platform.OS !== 'web') {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} else {
  // For web environment
  auth = getAuth(app);
}

const storage = getStorage(app);

// Initialize Firestore database
const db = getFirestore(app);

export { auth, storage, db };
export default app;
