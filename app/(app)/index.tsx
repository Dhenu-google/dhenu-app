import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the tabs interface
  return <Redirect href="/(app)/(drawer)/(tabs)" />;
}
