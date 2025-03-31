import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useSession } from "@/context";
import * as Location from "expo-location";
import { DB_API_URL } from "@/config";
import { Picker } from "@react-native-picker/picker"; // Import Picker for dropdown
import { getFirebaseAuthErrorMessage } from "@/lib/auth-err-handler";

/**
 * SignUp component handles new user registration
 * @returns {JSX.Element} Sign-up form component
 */
export default function SignUp() {
  // ============================================================================
  // Hooks & State
  // ============================================================================
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  type UserRole = "Farmer" | "Gaushala Owner" | "Public";
  const [role, setRole] = useState<UserRole>("Farmer"); // Add state for role selection
  const { signUp } = useSession();
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handles the registration process
   * @returns {Promise<Models.User<Models.Preferences> | null>}
   */
  const handleRegister = async () => {
    try {
      const location = await fetchUserLocation();
      if (location) {
        const user = await signUp(email, password, name, role, location.latitude, location.longitude);
        return user;
      }
    } catch (err: any) {
      console.error("[handleRegister Error] ==> ", err); // Log the full error object
      const errorMessage = getFirebaseAuthErrorMessage(err.code || "unknown");
      Alert.alert("Sign-Up Error", errorMessage);
      return null;
    }
  };

  
  /** Fetch User's Current Location 
  /* @returns {Promise<latitude:number; longitude:number>}
  */
const fetchUserLocation = async():Promise<{latitude:number; longitude:number} | null> =>{
  try{
    const {status } = await Location.requestForegroundPermissionsAsync();
    if(status!=="granted")
    {
      Alert.alert("Permission Denied", "Location Permission is Required");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    const {latitude,longitude} = location.coords;
    console.log("Fetched Location:", { latitude, longitude }); 
    return {latitude, longitude};
  }
  catch(err){
    console.error("[fetchUserLocation]==>", err);
    Alert.alert("Error", "Failed to fetch location");
    return null;
  }
 };


  /**
   * Handles the sign-up button press
   */
  const handleSignUpPress = async () => {
    setIsLoading(true); // Show loading indicator
    const resp = await handleRegister();
    setIsLoading(false); // Hide loading indicator
    if (resp) {
      router.replace("/(app)");
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <View className="flex-1 justify-center items-center p-4">
      {/* Welcome Section */}
      <View className="items-center mb-8">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Create Account
        </Text>
        <Text className="text-sm text-gray-500">
          Sign up to get started
        </Text>
      </View>

      {/* Form Section */}
      <View className="w-full max-w-[300px] space-y-4 mb-8">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
            Name
          </Text>
          <TextInput
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            textContentType="name"
            autoCapitalize="words"
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
            Email
          </Text>
          <TextInput
            placeholder="name@mail.com"
            value={email}
            onChangeText={setEmail}
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
            Password
          </Text>
          <TextInput
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
          />
        </View>

        {/* Role Selection */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
            Select Role
          </Text>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            style={{
              height: 50,
              width: "100%",
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              backgroundColor: "white",
            }}
          >
            <Picker.Item label="Farmer" value="Farmer" />
            <Picker.Item label="Gaushala Owner" value="Gaushala Owner" />
            <Picker.Item label="Public" value="Public" />
          </Picker>
        </View>
      </View>

      {/* Sign Up Button */}
      <Pressable
        onPress={handleSignUpPress}
        disabled={isLoading} // Disable button while loading
        className={`${
          isLoading ? "bg-blue-400" : "bg-blue-600"
        } w-full max-w-[300px] py-3 rounded-lg active:bg-blue-700`}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" /> // Show loading spinner
        ) : (
          <Text className="text-white font-semibold text-base text-center">
            Sign Up
          </Text>
        )}
      </Pressable>

      {/* Sign In Link */}
      <View className="flex-row items-center mt-6">
        <Text className="text-gray-600">Already have an account?</Text>
        <Link href="/sign-in" asChild>
          <Pressable className="ml-2">
            <Text className="text-blue-600 font-semibold">Sign In</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
