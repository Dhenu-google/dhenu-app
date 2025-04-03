# DHENU

**DHENU** is an AI-powered mobile app developed to conserve and propagate Indian cow breeds by assisting farmers, Gaushala owners, and the general public. Built specifically for the challenges of urbanization and industrialization, DHENU combines traditional cow-care insights with advanced AI guidance and community support to ensure the ecological and socio-economic viability of indigenous cow breeds.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Running the App](#installation--running-the-app)
- [Usage](#usage)
- [Demo & Resources](#demo--resources)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview
DHENU addresses the decline in Indian cow populations and genetic quality by providing a comprehensive solution that includes:
- **Intelligent Cow Management:** Keep track of cow health, breeding history, and overall management.
- **AI-Driven Guidance:** Use machine learning-based insights to improve breeding and cow care.
- **Community Support & Public Awareness:** Enable the public to report stray/injured cows and connect with nearby Gaushalas.
- **E-Commerce Platform:** Support cow-based products and services, creating economic incentives for cow preservation.
- **Multilingual Support:** Integrated translation ensures non-English-speaking farmers can easily access the app.

This app is designed for sustainable agriculture and rural livelihoods, ensuring that traditional practices are preserved while integrating modern technology.

## Features
- **Farmer & Gaushala Dashboard:** Manage cow records and monitor cow health.
- **Community Forum:** Connect with other farmers and share best practices.
- **Cow-Based Online Platform:** Buy and sell cow-related products and services.
- **Gemini-Powered Chatbot & Breeding Bot:** Get AI-driven advice on cow care and breeding.
- **Maps Integration:** Locate nearby Gaushalas and report stray or injured cows.
- **Public Awareness Tools:** Increase visibility and educate the public about the importance of conserving Indian cow breeds.
- **Translation to Regional Languages:** Make the app accessible to a wider audience, especially in rural areas.

## Tech Stack
- **Frontend:** React Native (Expo CLI)  
- **Backend:** Flask (Python)  
- **Database & Authentication:**  
  - Firebase Authentication for user login & signup  
  - Firestore for storing user details, cow information, and forum discussions  
  - SQL Database for managing breed details and location information  
- **APIs & AI Integration:**  
  - Gemini API and Vertex AI for AI-driven features  
  - Google Text-to-Speech API  
  - Google Maps API and Google Places  
- **Cloud & Hosting:**  
  - Google Cloud Run  
  - Firebase Firestore

## Installation & Running the App
This project was built using **Expo** for React Native, making it simple to run on both Android and iOS devices. An APK has also been generated for easy installation on Android devices.

### To run the app locally:
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/dhenu.git
   cd dhenu







# Expo Firebase Authentication With Drawer and Nested Tab App 🔐

A modern authentication application built with [Expo](https://expo.dev), featuring a complete authentication flow using [Firebase](https://firebase.google.com/docs) as the backend service.

## Video Walkthrough
- 🎥 https://youtu.be/Yva2Ep717v0?si=R_FhSdTMjMsJUViW

## Features

  - Complete authentication flow
  - User sign-in
  - User registration
  - Secure session management
  - Logout functionality
  - Modern UI with Tailwind CSS
  - TypeScript for type safety
  - Organized file structure with Expo Router
  - Context-based state management

## Project Structure

```
app/
├── (app)/                   # Protected app routes
│   ├── (drawer)/           # Drawer navigation
│   │   └── (tabs)/         # Tab navigation
│   │       └── index.tsx   # Home screen
│   └── _layout.tsx         # App layout with auth protection
├── sign-in.tsx             # Sign in screen
├── sign-up.tsx             # Sign up screen
└── _layout.tsx             # Root layout
```

## Getting Started

1. Clone the repository

   ```bash
   git clone [repository-url]
   ```

2. Install dependencies

   ```bash
   yarn
   ```

3. Set up environment variables
   Create a `.env` file with your Firebase credentials:

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=
   ```

4. Start the development server
   ```bash
   npx expo start
   ```

## Project Setup

### Metro Configuration

The project uses a custom Metro configuration to support both Firebase Auth and NativeWind (Tailwind CSS). Here's the setup in `metro.config.js`:

```javascript
const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

module.exports = withNativeWind(config, { input: "./global.css" });
```

This configuration:

- Adds support for Firebase's CommonJS modules
- Integrates NativeWind for Tailwind CSS support
- Extends source extensions to include "mjs" and "cjs" files

### Firebase Auth Setup

Firebase Auth is configured with React Native persistence for maintaining authentication state:

```typescript
import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IGNORE IMPORT ERROR, this is a valid import, still investigating
import { getReactNativePersistence } from "firebase/auth/dist/rn/persistence";

// Initialize Firebase with persistence
let auth;
try {
  auth = getAuth();
} catch {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
```

## Technology Stack

- **Frontend Framework**: Expo/React Native
- **Styling**: Tailwind CSS (via NativeWind)
- **Navigation**: Expo Router
- **Backend**: Firebase
- **Language**: TypeScript
- **State Management**: React Context

## Key Components

- **Authentication Context**: Manages user session state and auth operations
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Drawer Navigation**: Side menu for app navigation
- **Tab Navigation**: Bottom tabs for main app sections

## Development

To start developing:

1. Run the development server:

   ```bash
   npx expo start
   ```

2. Choose your preferred development environment:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [NativeWind Documentation](https://www.nativewind.dev/getting-started/expo-router)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

## GitHub Issues Referenced

- https://github.com/react-navigation/react-navigation/issues/12237

