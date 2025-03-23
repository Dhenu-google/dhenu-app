import { Stack } from "expo-router";

export default function CowProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: "Cow Profile",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
} 