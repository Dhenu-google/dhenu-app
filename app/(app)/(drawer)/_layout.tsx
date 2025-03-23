import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DhenuHeader from "@/components/DhenuHeader";

/**
 * DrawerLayout implements the root drawer navigation for the app.
 * This layout wraps the tab navigation and other screens accessible via the drawer menu.
 */
const DrawerLayout = () => {
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
          name="(tabs)"
          options={{
            drawerLabel: "Home",
          }}
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
