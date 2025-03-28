import { Redirect, Stack } from "expo-router";
import { LogBox, View } from "react-native";
import DhenuHeader from "@/components/DhenuHeader";
import { ProductsProvider } from "./context/ProductsContext";
import {useSession} from "@/context/index";
import { ActivityIndicator } from "react-native-paper";

// Ignore specific harmless warnings
LogBox.ignoreLogs([
  "Overwriting fontFamily style attribute preprocessor"
]);

/**
 * AppLayout serves as the root authentication wrapper for the main app routes.
 * It ensures:
 * 1. Protected routes are only accessible to authenticated users
 * 2. Loading states are handled appropriately
 * 3. Unauthenticated users are redirected to sign-in
 *
 * This layout wraps all routes within the (app) directory, but not (auth) routes,
 * allowing authentication flows to remain accessible.
 */
export default function AppLayout() {
  const {user, isLoading} = useSession();

  if(isLoading){
    console.log("Loading User");
    return (
     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>);
  }
  if(!user) return <Redirect href="../landing" />;

  return (
    <ProductsProvider>
      <Stack 
        screenOptions={{ 
          headerShown: false,
        }}
      >
        <Stack.Screen name="(drawer)" />
        <Stack.Screen 
          name="product-details"
          options={{
            header: () => <DhenuHeader title="Product Details" />
          }}
        />
        <Stack.Screen 
          name="add-product"
          options={{
            header: () => <DhenuHeader title="Add Product" />
          }}
        />
        <Stack.Screen 
          name="cow-profile" 
          options={{
            header: () => <DhenuHeader title="Cow Profile" />
          }}
        />
        <Stack.Screen 
          name="add-cow" 
          options={{ 
            header: () => <DhenuHeader title="Add Cow" />
          }} 
        />
      </Stack>
    </ProductsProvider>
  );
}
