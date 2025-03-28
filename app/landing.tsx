import React from "react";
import { ActivityIndicator, View, Button, Text, Dimensions, TouchableOpacity, StyleSheet, Image } from "react-native"; // Fixed missing imports
import { useSession } from "@/context/index";
import { useRouter } from "expo-router"; // Corrected router import
import OnboardingScreen from "./OnboardingScreen.js";


export default function Landing() {
  const { user, role, isLoading, isRoleLoading } = useSession();
  const router = useRouter(); // Use router as a hook

  if (isLoading || isRoleLoading) {
    console.log("Loading in Landing Page.");
    return <ActivityIndicator />;
  }

  if (user && role) {
    // Redirect based on role
    if (role === "Farmer" || role === "Gaushala Owner") {
      router.replace("/(app)/drawer/(tabs)/");
    } else if (role === "Public") {
      router.replace("/(app)/drawer/(tab)/");
    }
    return null;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <OnboardingScreen/>
        </>
      )}
    </View>
  );
}