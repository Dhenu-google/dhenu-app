import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useSession } from "@/context";
import { getFirebaseAuthErrorMessage } from "@/lib/auth-err-handler";

/**
 * SignIn component handles user authentication through email and password
 * @returns {JSX.Element} Sign-in form component
 */
export default function SignIn() {
  // ============================================================================
  // Hooks & State
  // ============================================================================
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useSession();
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handles the sign-in process
   * @returns {Promise<Models.User<Models.Preferences> | null>}
   */
  const handleLogin = async () => {
    try {
      // Attempt to sign in the user
      return await signIn(email, password);
    } catch (err: any) {
      // Log the error for debugging purposes
      console.error("[handleLogin Error] ==> ", err);

      // Get a user-friendly error message based on the error code
      const errorMessage = getFirebaseAuthErrorMessage(err.code || "unknown");

      // Display the error message in an alert
      Alert.alert("Sign-In Error", errorMessage);

      // Return null to indicate failure
      return null;
    }
  };

  /**
   * Handles the sign-in button press
   */
  const handleSignInPress = async () => {
    setIsLoading(true); // Show loading indicator
    const resp = await handleLogin();
    setIsLoading(false); // Hide loading indicator
    console.log("response data : ",resp);
    if (resp) {
      // Navigate to the app's main page if sign-in is successful
      router.replace("/(app)");
    }
  };

  // ============================================================================
  // UI Rendering
  // ============================================================================

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-1 items-center justify-center">
        <View className="w-full max-w-sm">
          <Text className="text-3xl font-bold mb-6 text-center">Sign In</Text>

          <View className="space-y-4">
            <View className="mb-4">
              <TextInput
                className="p-3 border border-gray-300 rounded-lg"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-6">
              <TextInput
                className="p-3 border border-gray-300 rounded-lg"
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Sign In Button */}
            <Pressable
              onPress={handleSignInPress}
              disabled={isLoading} // Disable button while loading
              className={`${
                isLoading ? "bg-blue-400" : "bg-blue-500"
              } px-4 py-3 rounded-lg`}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" /> // Show loading spinner
              ) : (
                <Text className="text-white text-center font-semibold">
                  Sign In
                </Text>
              )}
            </Pressable>
          </View>

          <View className="mt-8 flex-row justify-center">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Link href="/sign-up" asChild>
              <Pressable>
                <Text className="text-blue-500 font-semibold">Sign Up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
