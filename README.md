# DHENU

**DHENU** is an AI-powered mobile app developed to conserve and propagate Indian cow breeds by assisting farmers, Gaushala owners, and the general public. Built specifically for the challenges of urbanization and industrialization, DHENU combines traditional cow-care insights with advanced AI guidance and community support to ensure the ecological and socio-economic viability of indigenous cow breeds.

## Table of Contents
- [Overview](#Overview)
- [Features](#Features)
- [Tech Stack](#Tech-stack)
- [Installation & Running the App](#installation--running-the-app)
- [Usage](#To-run-the-app-locally)
- [Demo & Resources](#demo--resources)
- [Contributing](#contributing)
- [License](#license)

## Overview
DHENU addresses the decline in Indian cow populations and genetic quality by providing a comprehensive solution that includes:
- **Intelligent Cow Management:** Keep track of cow health, breeding history, and overall management.
- **AI-Driven Guidance:** Use machine learning-based insights to improve breeding and cow care.
- **Community Support & Public Awareness:** Enable the public to report stray/injured cows and connect with nearby Gaushalas.
- **E-Commerce Platform:** Support cow-based products and services, creating economic incentives for cow preservation.
- **Multilingual Support:** Integrated translation ensures non-English-speaking farmers can easily access the app.

This app is designed for sustainable agriculture and rural livelihoods, ensuring that traditional practices are preserved while integrating modern technology.

## Features
| Feature                     | Description                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|
| **Farmer Dashboard**        | Manage cow records and monitor health.                                     |
| **Community Forum**         | Connect with other farmers and share best practices.                       |
| **AI-Powered Chatbot**      | Two chatbots: one for farmers offering care advice and specific cow details, and another for the general public, personified to simulate conversations with cows. |
| **Breeding Recommendations**| Receive AI-based suggestions for optimal breeding practices.               |
| **Maps Integration**        | Locate nearby Gaushalas and report stray or injured cows.                  |
| **Report Stray Cows**       | Notify authorities or nearby Gaushalas about stray or injured cows.         |
| **E-Commerce Platform**     | Buy and sell cow-related products and services.                            |
| **Multilingual Support**    | Access the app in regional languages for better usability.                 |
| **Network Feature**         | Discover nearby farmers, Gaushalas, veterinarians, and NGOs to build a supportive community. |

## Tech Stack
- **Frontend:** React Native (Expo CLI)  
- **Backend:** Flask (Python), SQLAlchemy  
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
  - Firebase Storage
  - Firebase Auth
  - Google Cloud SQL

## Installation & Running the App
This project was built using **Expo** for React Native, making it simple to run on both Android and iOS devices. An APK has also been generated for easy installation on Android devices.

### Prerequisites
- Node.js >= 16.x
- Expo CLI installed globally:
  ```bash
  npm install -g expo-cli
  ```

### To run the app locally:
1. Clone the Repository:
   ```bash
   git clone https://github.com/Dhenu-google/dhenu-app.git
   cd dhenu-app
   ```

2. Install Dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file with your Firebase credentials:

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=
   EXPO_PUBLIC_GMAPS_API_KEY=
   EXPO_PUBLIC_GEMINI_API_KEY=
   EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=
   ```
4. Start the development server
   ```bash
   npx expo start
   ```
## Demo & Resources
1. [Youtube Link for Demo Video](https://www.youtube.com/watch?v=mXnJqYwebF8)
2. [Site](dhenu-app.github.io)
3. [APK for android](https://drive.google.com/drive/u/0/folders/1_qJ92q6UIrPFRnFsFeUGSRQa6IS2mXy2)


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

