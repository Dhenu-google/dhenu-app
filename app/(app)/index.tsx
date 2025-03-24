import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";
import { useSession } from "@/context"; // Import the custom hook from AuthContext
import { DB_API_URL } from "@/config";

export default function Index() {
  console.log("Index() is being rendered");
  const { user, isLoading } = useSession(); // Access user and loading state from AuthContext
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRoleLoading(false);
        return;
      }

      try {
        const response = await fetch(`${DB_API_URL}/get_role/${user.uid}`); // Fetch role using user ID
        const data = await response.json();

        if (response.ok) {
          console.log("Fetched this role for user (index.tsx) :", data.role);
          setRole(data.role);
        } else {
          console.error(data.error || "Failed to fetch role");
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  if (isLoading || roleLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Please log in to continue.</Text>
      </View>
    );
  }

  if (role === "Farmer" || role === "Gaushala Owner") {
    return <Redirect href="/(app)/(drawer)/(tabs)" />;
  } else if (role === "Public") {
    return <Redirect href="/(app)/forum" />;
  } else {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading ...</Text>
      </View>
    );
  }
}
