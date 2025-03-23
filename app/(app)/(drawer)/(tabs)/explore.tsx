import React from "react";
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
  Animated 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

// Define the screen item type
interface ExploreItem {
  id: string;
  title: string;
  icon: string;
  route: any; // Using any to avoid typing issues with expo-router
}

export default function ExploreScreen() {
  // Animation values for button press
  const animatedScales = React.useRef([
    new Animated.Value(1),
    new Animated.Value(1), 
    new Animated.Value(1)
  ]).current;

  // List of screens to navigate to
  const exploreItems: ExploreItem[] = [
    {
      id: '1',
      title: 'Home',
      icon: 'home',
      route: '/(app)/(drawer)/(tabs)'
    },
    {
      id: '2',
      title: 'Forum',
      icon: 'chatbubbles',
      route: '/(app)/(drawer)/(tabs)/forum'
    },
    {
      id: '3',
      title: 'Profile',
      icon: 'person',
      route: '/(app)/(drawer)/profile'
    }
  ];

  // Animation for button press
  const animateButton = (index: number) => {
    Animated.sequence([
      Animated.timing(animatedScales[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(animatedScales[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Explore</ThemedText>
      </View>

      <View style={styles.listContainer}>
        {exploreItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <Link href={item.route} asChild>
              <TouchableOpacity
                onPress={() => animateButton(index)}
                activeOpacity={0.7}
              >
                <Animated.View 
                  style={[
                    styles.listItem,
                    { transform: [{ scale: animatedScales[index] }] }
                  ]}
                >
                  <Ionicons name={item.icon as any} size={22} color="#4C6EF5" />
                  <ThemedText style={styles.itemText}>{item.title}</ThemedText>
                  <Ionicons name="chevron-forward" size={18} color="#A0A0A0" />
                </Animated.View>
              </TouchableOpacity>
            </Link>
            {index < exploreItems.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#8B5CF6', // Lavender color
  },
  listContainer: {
    paddingTop: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  itemText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginLeft: 20,
  }
});
