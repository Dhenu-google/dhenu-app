import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DhenuHeader from "@/components/DhenuHeader";
import { useSession } from "@/context";
import { Redirect } from 'expo-router';
import { use } from "i18next";
import { ActivityIndicator } from "react-native-paper";
import { View } from "react-native";

/**
 * DrawerLayout implements the root drawer navigation for the app.
 * This layout wraps the tab navigation and other screens accessible via the drawer menu.
 */
const DrawerLayout = () => {
  const { user,role, isLoading, isRoleLoading } = useSession();
  if(isLoading||isRoleLoading){
    return (
     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>);
  }
  if(!user) return <Redirect href="/landing" />;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          header: () => <DhenuHeader />,
        }}
      >
        {/* 
          (tabs) route contains the TabLayout with bottom navigation
          - Nested inside the drawer as the main content
        */}
        <Drawer.Screen
          name="(tab)"  // For roleA
          options={{
            drawerLabel: "Public Dashboard",
            title: "Public Dashboard"
          }}
          redirect={role !== 'Public'} // Only visible for roleA
        />
        {/* <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Home",
          }}
        /> */}
        <Drawer.Screen
          name="(tabs)"  // For roleB
          options={{
            drawerLabel: "Cow Owner Dashboard",
            title: "Owner Dashboard"
          }}
          redirect={role !== 'Farmer' && role !== "Gaushala Owner"} // Only visible for roleB
        />
        {/* 
          Additional drawer routes can be added here
          - Each represents a screen accessible via the drawer menu
          - Will use the drawer header by default
        */}
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: "Profile", // Label shown in drawer menu
            header: () => <DhenuHeader title="Profile" />, // Custom header with title
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DrawerLayout;
