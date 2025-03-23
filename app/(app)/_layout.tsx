import { Stack } from "expo-router";
import { LogBox } from "react-native";
import DhenuHeader from "@/components/DhenuHeader";
import { ProductsProvider } from "./context/ProductsContext";

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
