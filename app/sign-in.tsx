import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable, Alert, ActivityIndicator, ImageBackground, Image } from "react-native";
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
    <ImageBackground
      source={require("@/assets/images/bg.png")}
      className="flex-1"
    >
      <View className="flex-1 bg-black/30">
        <View className="flex-1 items-center justify-center p-4">
          <View className="w-full max-w-sm bg-white/90 p-6 rounded-2xl shadow-lg">
            <View className="items-center mb-6">
              <Image 
                source={require("@/assets/images/Moo.jpg")}
                className="w-24 h-24 rounded-full mb-4"
                resizeMode="cover"
              />
              <Text className="text-3xl font-bold text-center text-gray-800">Sign In</Text>
            </View>

            <View className="space-y-4">
              <View className="mb-4">
                <TextInput
                  className="p-3 border border-gray-300 rounded-lg bg-white"
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-6">
                <TextInput
                  className="p-3 border border-gray-300 rounded-lg bg-white"
                  placeholder="Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Sign In Button */}
              <Pressable
                onPress={handleSignInPress}
                disabled={isLoading}
                className={`${
                  isLoading ? "bg-blue-400" : "bg-blue-500"
                } px-4 py-3 rounded-lg`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
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
    </ImageBackground>
  );
}
