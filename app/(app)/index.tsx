import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";
import { useSession } from "@/context"; // Import the custom hook from AuthContext
import { DB_API_URL } from "@/config";
import { use } from "i18next";

export default function Index() {
  console.log("Index() is being rendered");
  const { user, isLoading } = useSession(); // Access user and loading state from AuthContext
  const { role, isRoleLoading } = useSession();

  if (isLoading || isRoleLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user || !role) {
    return (
      <Redirect href="../signin" />
    );
  }

  if (role === "Farmer" || role === "Gaushala Owner") {
    return <Redirect href="/(app)/(drawer)/(tabs)" />;
  } else if (role === "Public") {
    return <Redirect href="/(app)/(drawer)/(tab)" />;
  } else {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading ...</Text>
      </View>
    );
  }
}
