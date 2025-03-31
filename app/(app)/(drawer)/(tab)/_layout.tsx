import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// TabBar icon component
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
}

/**
 * TabLayout manages the bottom tab navigation
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarStyle: {
          backgroundColor: "#5D4037",
          borderTopColor: "#faebd7",
        },
        tabBarLabelStyle: {
          color: "#FFFFFF"
        },
        headerShown: false, // Hide the tab headers since we're using the DhenuHeader
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color="#FFFFFF" />
          ),
        }}
      />
    </Tabs>
  );
}
