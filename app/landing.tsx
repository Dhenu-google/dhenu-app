import React from "react";
import { ActivityIndicator, View, Button, Text } from "react-native"; // Fixed missing imports
import { useSession } from "@/context/index";
import { useRouter } from "expo-router"; // Corrected router import

export default function Landing() {
  const { user, role, isLoading, isRoleLoading } = useSession();
  const router = useRouter(); // Use router as a hook

  if (isLoading || isRoleLoading) {
    console.log("Loading in Landing Page.");
    return <ActivityIndicator />;
  }

  if (user && role) {
    // Redirect based on role
    if (role === "Farmer" || role === "Gaushal Owner") {
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
          <Text>Welcome to Our App!</Text>
          <Button
            title="Get Started"
            onPress={() => router.push('/sign-in')}
          />
        </>
      )}
    </View>
  );
}