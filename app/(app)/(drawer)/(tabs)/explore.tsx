import React from "react";
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
  Animated,
  Text
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";

// Define the screen item type
interface ExploreItem {
  id: string;
  titleKey: string; // Key for translation
  icon: React.ReactNode;
  route: any; // Using any to avoid typing issues with expo-router
  isForum?: boolean; // Flag to indicate if this is the forum item
}

export default function ExploreScreen() {
  const { t } = useTranslation(); // Initialize translation hook
  
  // Animation values for button press
  const animatedScales = React.useRef([
    new Animated.Value(1),
    new Animated.Value(1), 
    new Animated.Value(1),
    new Animated.Value(1)
  ]).current;

  // List of screens to navigate to
  const exploreItems: ExploreItem[] = [
    {
      id: '1',
      titleKey: 'explore.networkAndNavigation',
      icon: 'map',
      route: '/(app)/network'
    },
    {
      id: '2',
      titleKey: 'explore.forum',
      icon: 'chatbubbles',
      route: '/forum-button',
      isForum: true
    },
    {
      id: '3',
      titleKey: 'explore.moomateAI',
      icon: 'leaf',
      route: '/(app)/cross-breeding'
    },
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

  // Handle navigation with special case for forum
  const handleNavigation = (item: ExploreItem, index: number) => {
    animateButton(index);
    
    if (item.isForum) {
      // Navigate to the forum-button screen which will handle the redirect
      setTimeout(() => {
        router.push(item.route);
      }, 200);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {t('explore.title', 'Explore')}
        </ThemedText>
      </View>

      <View style={styles.listContainer}>
        {exploreItems.map((item, index) => (
          <React.Fragment key={item.id}>
            {item.isForum ? (
              <TouchableOpacity
                onPress={() => handleNavigation(item, index)}
                activeOpacity={0.7}
              >
                <Animated.View 
                  style={[
                    styles.listItem,
                    { transform: [{ scale: animatedScales[index] }] }
                  ]}
                >
                  <Ionicons name={item.icon as any} size={22} color="#4C6EF5" />
                  <ThemedText style={styles.itemText}>{t(item.titleKey, item.titleKey.split('.')[1])}</ThemedText>
                  <Ionicons name="chevron-forward" size={18} color="#A0A0A0" />
                </Animated.View>
              </TouchableOpacity>
            ) : (
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
                    <ThemedText style={styles.itemText}>{t(item.titleKey, item.titleKey.split('.')[1])}</ThemedText>
                    <Ionicons name="chevron-forward" size={18} color="#A0A0A0" />
                  </Animated.View>
                </TouchableOpacity>
              </Link>
            )}
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
    color: '#999',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginLeft: 20,
  }
});
