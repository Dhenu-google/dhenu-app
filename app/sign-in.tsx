import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable } from "react-native";
import { useState } from "react";
import { useSession } from "@/context";

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

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handles the sign-in process
   * @returns {Promise<Models.User<Models.Preferences> | null>}
   */
  const handleLogin = async () => {
    try {
      return await signIn(email, password);
    } catch (err) {
      console.log("[handleLogin] ==>", err);
      return null;
    }
  };

  /**
   * Handles the sign-in button press
   */
  const handleSignInPress = async () => {
    const resp = await handleLogin();
    router.replace("/(app)");
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

            <Pressable
              className="bg-blue-500 px-4 py-3 rounded-lg"
              onPress={handleSignInPress}
            >
              <Text className="text-white text-center font-semibold">
                Sign In
              </Text>
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
