import { useSession } from "@/context";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

const ProfileScreen = () => {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { signOut, user } = useSession();

  // ============================================================================
  // Handlers
  // ============================================================================
  
  /**
   * Handles the logout process
   */
  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  // ============================================================================
  // Computed Values
  // ============================================================================
  
  /**
   * Gets the display name for the welcome message
   * Prioritizes user's name, falls back to email, then default greeting
   */
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Guest";

  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <View className="flex-1 mt-4 p-4">
      {/* Welcome Section */}
      <View className="mb-8">
        <Text className="text-xl font-bold text-blue-900">
          Name: {displayName}
        </Text>
        <Text className="text-xl font-semibold text-blue-900 mt-2">
          Email: {user?.email}
        </Text>
        <Text className="text-normL font-semibold text-blue-900 mt-2">
          Last Seen: {user?.metadata?.lastSignInTime}
        </Text>
        <Text className="text-normal font-semibold text-blue-900 mt-2">
          Created: {user?.metadata?.creationTime}
        </Text>
      </View>
      {/* Logout Button */}
      <Pressable
        onPress={handleLogout}
        className="bg-red-500 px-6 py-3 rounded-lg active:bg-red-600"
      >
        <Text className="text-white font-semibold text-base">Logout</Text>
      </Pressable>
    </View>
  );
};

export default ProfileScreen;
