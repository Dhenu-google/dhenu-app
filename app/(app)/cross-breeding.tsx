import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Platform,
  Text
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as Speech from 'expo-speech';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

// List of Indian cow breeds
const INDIAN_COW_BREEDS = [
  'Gir', 'Sahiwal', 'Tharparkar', 'Red Sindhi', 'Kankrej', 'Ongole', 'Vechur',
  'Deoni', 'Hariana', 'Rathi', 'Krishna Valley', 'Punganur', 'Khillar', 'Kangayam',
  'Kasargod Dwarf', 'Amritmahal', 'Bargur', 'Hallikar', 'Nagori', 'Gaolao', 'Dharwar'
];

// Sample recommendation data for each breed
const BREED_RECOMMENDATIONS: { [breed: string]: Array<{feature: string, selected: string, recommended: string, reason: string}> } = {
  'Gir': [
    {
      feature: 'Higher Milk Production',
      selected: 'Gir',
      recommended: 'Holstein Friesian',
      reason: 'Holstein Friesian cattle are known for exceptionally high milk yields. Crossing with Gir creates offspring with improved milk production while retaining heat tolerance and disease resistance.',
    },
    {
      feature: 'Better Heat & Disease Resistance',
      selected: 'Gir',
      recommended: 'Sahiwal',
      reason: 'Sahiwal cattle have excellent disease resistance and heat tolerance. Crossing with Gir enhances these traits while maintaining good milk production.',
    },
    {
      feature: 'Higher Butterfat Content',
      selected: 'Gir',
      recommended: 'Red Sindhi',
      reason: 'Red Sindhi cows produce milk with high fat content (4.5-5.5%). Crossing with Gir increases butterfat percentage while maintaining good milk yield.',
    }
  ],
  'Sahiwal': [
    {
      feature: 'Higher Milk Production',
      selected: 'Sahiwal',
      recommended: 'Jersey',
      reason: 'Jersey cattle produce milk with high butterfat content. When crossed with Sahiwal, offspring have increased milk production while maintaining adaptability to tropical conditions.',
    },
    {
      feature: 'Better Heat & Disease Resistance',
      selected: 'Sahiwal',
      recommended: 'Gir',
      reason: 'Gir cattle have excellent thermal regulation and tick resistance. Crossing with Sahiwal enhances disease resistance while maintaining milk quality.',
    },
    {
      feature: 'Higher Butterfat Content',
      selected: 'Sahiwal',
      recommended: 'Red Sindhi',
      reason: 'Red Sindhi produces milk with very high fat percentage. This crossbreeding increases the butterfat content of Sahiwal\'s already good quality milk.',
    }
  ],
  'Red Sindhi': [
    {
      feature: 'Higher Milk Production',
      selected: 'Red Sindhi',
      recommended: 'Sahiwal',
      reason: 'Sahiwal is known for good milk yield in tropical conditions. This cross enhances milk production while maintaining the heat tolerance of Red Sindhi.',
    },
    {
      feature: 'Better Heat & Disease Resistance',
      selected: 'Red Sindhi',
      recommended: 'Tharparkar',
      reason: 'Tharparkar cattle are extremely hardy desert animals. Crossing with Red Sindhi creates excellent disease and heat resistant offspring.',
    },
    {
      feature: 'Higher Butterfat Content',
      selected: 'Red Sindhi',
      recommended: 'Gir',
      reason: 'Gir breeds have good fat content in milk. When crossed with Red Sindhi\'s already high butterfat milk, the result is exceptional milk quality for dairy products.',
    }
  ],
};

// Function to generate generic recommendation data for any breed
const getGenericRecommendation = (breed: string): Array<{feature: string, selected: string, recommended: string, reason: string}> => {
  return [
    {
      feature: 'Higher Milk Production',
      selected: breed,
      recommended: 'Sahiwal',
      reason: 'Sahiwal is known for its high milk yield and when crossed with ' + breed + ', it can enhance milk production while maintaining the native breed\'s adaptability.',
    },
    {
      feature: 'Better Heat & Disease Resistance',
      selected: breed,
      recommended: 'Gir',
      reason: 'Gir cattle are highly resistant to tropical diseases and heat stress. Crossing with ' + breed + ' will improve offspring\'s resilience.',
    },
    {
      feature: 'Higher Butterfat Content',
      selected: breed,
      recommended: 'Red Sindhi',
      reason: 'Red Sindhi cows produce milk with high fat content, ideal for dairy products. This trait can be passed to ' + breed + ' crosses.',
    }
  ];
};

// Mock function to get cow count by breed - replace with actual data fetch
const getCowCountByBreed = (breed: string) => {
  // This would typically come from a database or API
  return Math.floor(Math.random() * 5); // Mock data - replace with real implementation
};

export default function CrossBreedingScreen() {
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [cowCount, setCowCount] = useState<number>(0);
  const [recommendationData, setRecommendationData] = useState<Array<{feature: string, selected: string, recommended: string, reason: string}> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Update cow count when breed changes
  useEffect(() => {
    if (selectedBreed) {
      setCowCount(getCowCountByBreed(selectedBreed));
    }
  }, [selectedBreed]);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const parseApiResponse = (responseText: string): Array<{feature: string, selected: string, recommended: string, reason: string}> => {
    try {
      // Try to parse the markdown table from the response
      const lines = responseText.trim().split('\n').filter(line => line.trim().length > 0);
      const tableLines = lines.filter(line => line.includes('|'));
      
      if (tableLines.length >= 5) { // Header, separator, and at least 3 data rows
        // Skip header and separator
        const dataRows = tableLines.slice(2);
        const result = [];
        
        for (const row of dataRows) {
          const columns = row.split('|').map(col => col.trim()).filter(col => col.length > 0);
          if (columns.length >= 4) {
            result.push({
              feature: columns[0],
              selected: columns[1],
              recommended: columns[2],
              reason: columns[3]
            });
          }
        }
        
        if (result.length > 0) {
          return result;
        }
      }
      
      // If parsing fails, use fallback
      return BREED_RECOMMENDATIONS[selectedBreed] || getGenericRecommendation(selectedBreed);
    } catch (error) {
      console.error('Error parsing API response:', error);
      return BREED_RECOMMENDATIONS[selectedBreed] || getGenericRecommendation(selectedBreed);
    }
  };

  const getRecommendation = async () => {
    if (!selectedBreed) {
      return;
    }

    setLoading(true);
    
    try {
      // Try to get recommendation from API first
      const apiResponse = await fetch(`/api/cross-breeding-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ breed: selectedBreed }),
      });

      // Check if API call was successful
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        
        // Parse the markdown table from the API response
        const parsedData = parseApiResponse(data.recommendation);
        setRecommendationData(parsedData);
      } else {
        // If API fails, use fallback
        console.log('API request failed, using fallback recommendation');
        // Get recommendation from hardcoded list or generate generic one
        const fallbackData = BREED_RECOMMENDATIONS[selectedBreed] || getGenericRecommendation(selectedBreed);
        setRecommendationData(fallbackData);
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      // Use fallback in case of error
      const fallbackData = BREED_RECOMMENDATIONS[selectedBreed] || getGenericRecommendation(selectedBreed);
      setRecommendationData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const speakRecommendation = async () => {
    if (!recommendationData) return;
    
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    // Create speech text from recommendation data
    const speechText = `Breeding recommendations for ${selectedBreed}. ` + 
      recommendationData.map(item => {
        return `For ${item.feature}, the recommended crossbreed is ${item.recommended} because ${item.reason}`;
      }).join('. ');
    
    try {
      setIsSpeaking(true);
      
      // Use appropriate voice for Indian English if available
      const options = {
        language: 'en-IN',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      };
      
      await Speech.speak(speechText, options);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
    }
  };

  // Custom Table component to properly display recommendations
  const RecommendationTable = ({ data }: { data: Array<{feature: string, selected: string, recommended: string, reason: string}> }) => {
    return (
      <View style={styles.tableContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.featureColumn]}>Feature</Text>
          <Text style={[styles.headerCell, styles.breedColumn]}>Selected Breed</Text>
          <Text style={[styles.headerCell, styles.breedColumn]}>Recommended Crossbreed</Text>
          <Text style={[styles.headerCell, styles.reasonColumn]}>Reason for Crossbreeding</Text>
        </View>
        
        {data.map((row, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
            <Text style={[styles.tableCell, styles.featureColumn]}>{row.feature}</Text>
            <Text style={[styles.tableCell, styles.breedColumn]}>{row.selected}</Text>
            <Text style={[styles.tableCell, styles.breedColumn]}>{row.recommended}</Text>
            <Text style={[styles.tableCell, styles.reasonColumn]}>{row.reason}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Cross-Breed Recommendation System',
          headerStyle: {
            backgroundColor: '#a5d8ff',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.content}>
          <View style={styles.pickerContainer}>
            <ThemedText style={styles.label}>Select breed</ThemedText>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  // For iOS we would typically show a modal with picker
                  // This is a simplification
                }}
              >
                <ThemedText style={styles.pickerText}>{selectedBreed || 'Select a breed'}</ThemedText>
                <Ionicons name="chevron-down" size={24} color="#333" />
              </TouchableOpacity>
            ) : (
              <View style={styles.androidPickerContainer}>
                <Picker
                  selectedValue={selectedBreed}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedBreed(itemValue as string)}
                  mode="dropdown"
                >
                  <Picker.Item label="Select a breed" value="" />
                  {INDIAN_COW_BREEDS.map((breed) => (
                    <Picker.Item key={breed} label={breed} value={breed} />
                  ))}
                </Picker>
              </View>
            )}
            
            {selectedBreed && (
              <View style={styles.cowCountContainer}>
                <ThemedText style={styles.cowCount}>
                  You have: <ThemedText style={styles.countHighlight}>{cowCount} cows of that breed</ThemedText>
                </ThemedText>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, !selectedBreed && styles.buttonDisabled]}
            onPress={getRecommendation}
            disabled={!selectedBreed || loading}
          >
            <ThemedText style={styles.buttonText}>
              Get recommendation
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.responseContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#ef4444" />
            ) : recommendationData ? (
              <>
                <Text style={styles.tableTitleText}>Breeding Recommendation for {selectedBreed}</Text>
                <ScrollView horizontal={true} style={styles.tableScrollView}>
                  <RecommendationTable data={recommendationData} />
                </ScrollView>
                <TouchableOpacity style={styles.audioButton} onPress={speakRecommendation}>
                  <Ionicons
                    name={isSpeaking ? "pause" : "volume-high"}
                    size={24}
                    color="#333"
                  />
                </TouchableOpacity>
              </>
            ) : (
              <ThemedText style={styles.placeholder}>
                Response will appear here...
              </ThemedText>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '500',
    color: '#111827',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8b5cf6', // Gemini-inspired purple
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerText: {
    color: '#111827',
    fontSize: 16,
  },
  androidPickerContainer: {
    borderWidth: 2,
    borderColor: '#8b5cf6', // Gemini-inspired purple
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#111827',
  },
  cowCountContainer: {
    marginTop: 12,
  },
  cowCount: {
    fontSize: 16,
    color: '#0369a1',
  },
  countHighlight: {
    fontWeight: 'bold',
    color: '#0369a1',
  },
  button: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonDisabled: {
    backgroundColor: '#f87171',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 20,
    backgroundColor: '#fff',
    minHeight: 200,
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tableScrollView: {
    marginTop: 10,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#3b82f6', // Blue border for table
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6', // Blue header background
    borderBottomWidth: 1,
    borderColor: '#3b82f6',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff', // White rows
  },
  evenRow: {
    backgroundColor: '#fff',
  },
  oddRow: {
    backgroundColor: '#f9fafb', // Very light gray for alternating rows
  },
  headerCell: {
    padding: 12,
    fontWeight: 'bold',
    color: '#fff', // White text for header
    fontSize: 14,
  },
  tableCell: {
    padding: 12,
    color: '#111827',
    fontSize: 14,
  },
  featureColumn: {
    width: 140,
    borderRightWidth: 1,
    borderColor: '#3b82f6', // Blue border between columns
  },
  breedColumn: {
    width: 100,
    borderRightWidth: 1,
    borderColor: '#3b82f6', // Blue border between columns
  },
  reasonColumn: {
    width: 200,
  },
  tableTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3b82f6', // Blue title text
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  audioButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 