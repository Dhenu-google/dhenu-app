import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SessionProvider, useSession } from "@/context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// Import your global CSS file
import "../global.css";

/**
 * Root Layout is the highest-level layout in the app, wrapping all other layouts and screens.
 * It provides:
 * 1. Global authentication context via SessionProvider
 * 2. Gesture handling support for the entire app
 * 3. Global styles and configurations
 *
 * This layout affects every screen in the app, including both authenticated
 * and unauthenticated routes.
 */

// Ensure authentication is set up properly with routing
function AuthRoot() {
  const { user, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if user is authenticated
    const inAuthGroup = segments[0] === "(app)";

    if (!user && inAuthGroup) {
      // If not authenticated but trying to access protected routes
      router.replace("/sign-in");
    } else if (user && !inAuthGroup) {
      // If authenticated and accessing auth routes, redirect to app
      router.replace("/(app)/(drawer)/(tabs)");
    }
  }, [user, segments, isLoading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

// Root layout sets up providers and initializes app structure
export default function RootLayout() {
  return (
    <SessionProvider>
      {/* 
        GestureHandlerRootView is required for:
        - Drawer navigation gestures
        - Swipe gestures
        - Other gesture-based interactions
        Must wrap the entire app to function properly
      */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthRoot />
      </GestureHandlerRootView>
    </SessionProvider>
  );
}
