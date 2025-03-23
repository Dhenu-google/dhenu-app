import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, Divider, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define interfaces for type safety
interface Cow {
  id: number;
  name: string;
  breed: string;
  age?: number;
  weight?: number;
  height?: number;
  milkYield?: number;
  origin?: string;
  image: string;
  status: Array<{ label: string; type: string }>;
  lastMilked: Date | null;
  lastFed: Date | null;
}

interface PerformanceMetric {
  value: number;
  avg: number;
  status: string;
}

interface PerformanceComparison {
  weight: PerformanceMetric;
  height: PerformanceMetric;
  milkYield: PerformanceMetric;
  age: PerformanceMetric;
}

interface CowInsights {
  description: string;
  nutritionTips: string;
  milkingRecommendations: string;
  healthIssues: string;
  performanceComparison: PerformanceComparison;
  healthTips: Array<{
    title: string;
    content: string;
    icon?: string;
  }>;
}

// Default breed averages
const breedAverages: Record<string, {weight: number, height: number, milkYield: number, age: number}> = {
  'Gir': { weight: 1100, height: 145, milkYield: 28, age: 4 },
  'Sahiwal': { weight: 1000, height: 140, milkYield: 25, age: 4 },
  'Guernsey': { weight: 1150, height: 143, milkYield: 30, age: 5 },
  'Holstein': { weight: 1500, height: 150, milkYield: 35, age: 5 },
  'Jersey': { weight: 900, height: 135, milkYield: 22, age: 4 },
  'Brown Swiss': { weight: 1300, height: 148, milkYield: 32, age: 5 },
  'Ayrshire': { weight: 1200, height: 142, milkYield: 28, age: 4 },
  'Angus': { weight: 1400, height: 145, milkYield: 0, age: 6 },
  'Hereford': { weight: 1450, height: 147, milkYield: 0, age: 6 },
  'Brahman': { weight: 1300, height: 150, milkYield: 20, age: 5 }
};

// Default for unspecified breeds
const defaultAverage = { weight: 1200, height: 145, milkYield: 25, age: 5 };

// This would be replaced by actual imports in your app
// For demo purposes, mocking these imports/functions
const mockGeminiAPI = {
  getGeminiCowInsights: async (cow: Cow): Promise<CowInsights> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get breed averages or use defaults
    const breedAvg = breedAverages[cow.breed] || defaultAverage;
    
    // Calculate comparison statuses
    const getComparisonStatus = (value: number | undefined, avg: number) => {
      if (!value) return 'no data';
      const percentage = ((value - avg) / avg) * 100;
      if (percentage >= 10) return 'well above average';
      if (percentage >= 5) return 'above average';
      if (percentage >= -5) return 'average';
      if (percentage >= -10) return 'below average';
      return 'well below average';
    };
    
    const generateBreedDescription = (breed: string) => {
      const descriptions: Record<string, string> = {
        'Gir': "The Gir is an indigenous cattle breed from India, known for its distinctive long, pendulous ears and dome-shaped forehead. These cattle are well adapted to tropical conditions and are valued for their high-quality milk rich in fat content.",
        'Sahiwal': "Sahiwal cattle are a hardy zebu breed from the Punjab region, recognized for their remarkable heat tolerance and resistance to parasites. They produce good milk yields even in harsh environments and are known for their calm temperament.",
        'Guernsey': "The Guernsey is a dairy breed from the Channel Islands, producing milk with a golden-yellow tint due to high beta-carotene content. They are medium-sized cattle with gentle dispositions and efficient feed conversion.",
        'Holstein': "Holstein cattle are the world's highest-producing dairy animals, easily recognized by their distinctive black and white markings. Originally from the Netherlands, they have been selectively bred for milk production and adaptability.",
        'Jersey': "The Jersey is a small dairy breed from the Channel Islands, producing milk with the highest milk fat percentage of all dairy breeds. They are known for their feed efficiency, heat tolerance, and earlier maturity compared to other dairy breeds.",
        'Brown Swiss': "Brown Swiss cattle are one of the oldest dairy breeds, originating from the Swiss Alps. They are known for their excellent longevity, strong feet and legs, and ability to produce large volumes of milk with ideal cheese-making properties.",
        'Ayrshire': "Ayrshire cattle come from Scotland and are medium-sized dairy cows with distinctive red and white markings. They are known for their hardiness, good udder conformation, and ability to thrive on lower-quality forage.",
        'Angus': "Angus cattle are a beef breed from Scotland, known for their naturally polled (hornless) characteristic and solid black or red coloration. They produce high-quality marbled beef and have excellent maternal traits.",
        'Hereford': "Hereford cattle are a popular beef breed from England, easily identified by their distinctive white face, white underside, and reddish-brown body. They are known for their early maturity, docility, and ability to thrive in various environments.",
        'Brahman': "Brahman cattle are a large zebu breed developed in the United States from Indian cattle breeds. They have a distinctive large hump, floppy ears, and loose skin, all adaptations that help with heat dissipation in tropical climates."
      };
      
      return descriptions[breed] || `The ${breed} breed is known for its distinctive characteristics and adaptability to local conditions.`;
    };
    
    return {
      description: generateBreedDescription(cow.breed),
      nutritionTips: `${cow.breed} cattle require a balanced diet with quality forage and supplements. Regular access to fresh water is essential, along with mineral blocks to support overall health and milk production.`,
      milkingRecommendations: `For optimal milk production, ${cow.breed} cows should be milked at regular intervals in a stress-free environment. Consistent milking times and gentle handling help maintain good yields and prevent mastitis.`,
      healthIssues: `Monitor ${cow.breed} cattle for common health issues including mastitis, lameness, and metabolic disorders. Regular veterinary check-ups and preventive vaccinations are essential for maintaining herd health.`,
      performanceComparison: {
        weight: {
          value: cow.weight || 0,
          avg: breedAvg.weight,
          status: getComparisonStatus(cow.weight, breedAvg.weight)
        },
        height: {
          value: cow.height || 0,
          avg: breedAvg.height,
          status: getComparisonStatus(cow.height, breedAvg.height)
        },
        milkYield: {
          value: cow.milkYield || 0,
          avg: breedAvg.milkYield,
          status: getComparisonStatus(cow.milkYield, breedAvg.milkYield)
        },
        age: {
          value: cow.age || 0,
          avg: breedAvg.age,
          status: cow.age ? (cow.age <= breedAvg.age ? 'perfect' : 'mature') : 'no data'
        }
      },
      healthTips: [
        { 
          title: "Nutrition", 
          content: `For optimal health, provide a balanced diet rich in fiber and proteins. ${cow.breed} cattle benefit from specialized mineral supplements.`,
          icon: "leaf"
        },
        { 
          title: "Hydration", 
          content: `Ensure access to clean water at all times. ${cow.breed} cattle need consistent hydration, especially during warm weather.`,
          icon: "water"
        },
        { 
          title: "Exercise", 
          content: "Allow for daily movement in pasture to maintain muscle tone and joint health.",
          icon: "pulse"
        },
        { 
          title: "Production", 
          content: "Monitor milk production patterns. Gradual increase with proper nutrition is optimal.",
          icon: "stats-chart"
        }
      ]
    };
  }
};

export default function CowProfile() {
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<CowInsights | null>(null);
  const [cowDetails, setCowDetails] = useState<Cow | null>(null);
  
  const screenWidth = Dimensions.get('window').width;

  // Fetch cow details from storage
  useEffect(() => {
    const fetchCowDetails = async () => {
      try {
        setLoading(true);
        const savedCows = await AsyncStorage.getItem('cows');
        
        if (savedCows) {
          const allCows = JSON.parse(savedCows);
          // Convert date strings back to Date objects
          const cowsWithDates = allCows.map((cow: any) => ({
            ...cow,
            lastMilked: cow.lastMilked ? new Date(cow.lastMilked) : null,
            lastFed: cow.lastFed ? new Date(cow.lastFed) : null
          }));
          
          const cowId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
          const foundCow = cowsWithDates.find((cow: Cow) => cow.id === cowId);
          
          if (foundCow) {
            setCowDetails(foundCow);
          } else {
            console.error('Cow not found');
            // Navigate back to dashboard if cow not found
            router.replace('/(app)/(drawer)/(tabs)/dashboard');
          }
        } else {
          console.error('No cows found in storage');
          router.replace('/(app)/(drawer)/(tabs)/dashboard');
        }
      } catch (error) {
        console.error('Error fetching cow details:', error);
      }
    };
    
    fetchCowDetails();
  }, [id]);

  // Fetch Gemini insights when cow details are loaded
  useEffect(() => {
    const getInsights = async () => {
      if (!cowDetails) return;
      
      try {
        setLoading(true);
        const cowInsights = await mockGeminiAPI.getGeminiCowInsights(cowDetails);
        setInsights(cowInsights);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    getInsights();
  }, [cowDetails]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh insights
    if (cowDetails) {
      mockGeminiAPI.getGeminiCowInsights(cowDetails)
        .then(newInsights => {
          setInsights(newInsights);
          setRefreshing(false);
        })
        .catch(error => {
          console.error('Error refreshing insights:', error);
          setRefreshing(false);
        });
    } else {
      setRefreshing(false);
    }
  }, [cowDetails]);

  if (loading && !insights) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading cow insights...</Text>
      </View>
    );
  }

  if (!cowDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cow not found</Text>
        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => router.replace('/(app)/(drawer)/(tabs)/dashboard')}
        >
          Back to Dashboard
        </Button>
      </View>
    );
  }

  // Define performanceData with the correct type
  const performanceData: PerformanceComparison = insights?.performanceComparison || {
    weight: { value: 0, avg: 0, status: '' },
    height: { value: 0, avg: 0, status: '' },
    milkYield: { value: 0, avg: 0, status: '' },
    age: { value: 0, avg: 0, status: '' }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Image */}
        <Image 
          source={{ uri: cowDetails.image }} 
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        {/* Cow Details Card */}
        <Card style={styles.card}>
          <Card.Content style={styles.cowDetailsContent}>
            <Text style={styles.cowName}>{cowDetails.name}</Text>
            <Text style={styles.breedName}>{cowDetails.breed}</Text>
            {cowDetails.origin && <Text style={styles.location}>{cowDetails.origin}</Text>}
            
            <View style={styles.metricsContainer}>
              <View style={styles.metricColumn}>
                <Text style={styles.metricLabel}>Age</Text>
                <Text style={styles.metricValue}>{cowDetails.age || 'N/A'} {cowDetails.age ? 'years' : ''}</Text>
                {cowDetails.age && (
                  <View style={styles.comparisonRow}>
                    <Ionicons 
                      name={performanceData.age.status.includes('above') || performanceData.age.status === 'perfect' ? 'checkmark' : 'arrow-down'} 
                      size={14} 
                      color={performanceData.age.status.includes('below') ? '#f44336' : '#4caf50'} 
                    />
                    <Text style={styles.comparisonText}>
                      {performanceData.age.status} (avg: {performanceData.age.avg} years)
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.metricColumn}>
                <Text style={styles.metricLabel}>Weight</Text>
                <Text style={styles.metricValue}>{cowDetails.weight || 'N/A'} {cowDetails.weight ? 'lbs' : ''}</Text>
                {cowDetails.weight && (
                  <View style={styles.comparisonRow}>
                    <Ionicons 
                      name={performanceData.weight.status.includes('above') ? 'arrow-up' : performanceData.weight.status.includes('average') ? 'checkmark' : 'arrow-down'} 
                      size={14} 
                      color={performanceData.weight.status.includes('below') ? '#f44336' : '#4caf50'} 
                    />
                    <Text style={styles.comparisonText}>
                      {performanceData.weight.status} (avg: {performanceData.weight.avg} lbs)
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.metricsContainer}>
              <View style={styles.metricColumn}>
                <Text style={styles.metricLabel}>Height</Text>
                <Text style={styles.metricValue}>{cowDetails.height || 'N/A'} {cowDetails.height ? 'cm' : ''}</Text>
                {cowDetails.height && (
                  <View style={styles.comparisonRow}>
                    <Ionicons 
                      name={performanceData.height.status.includes('above') ? 'arrow-up' : performanceData.height.status.includes('average') ? 'checkmark' : 'arrow-down'} 
                      size={14} 
                      color={performanceData.height.status.includes('below') ? '#f44336' : '#4caf50'} 
                    />
                    <Text style={styles.comparisonText}>
                      {performanceData.height.status} (avg: {performanceData.height.avg} cm)
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.metricColumn}>
                <Text style={styles.metricLabel}>Milk Yield</Text>
                <Text style={styles.metricValue}>{cowDetails.milkYield || 'N/A'} {cowDetails.milkYield ? 'gal/day' : ''}</Text>
                {cowDetails.milkYield && (
                  <View style={styles.comparisonRow}>
                    <Ionicons 
                      name={performanceData.milkYield.status.includes('above') ? 'arrow-up' : performanceData.milkYield.status.includes('average') ? 'checkmark' : 'arrow-down'} 
                      size={14} 
                      color={performanceData.milkYield.status.includes('below') ? '#f44336' : '#4caf50'} 
                    />
                    <Text style={styles.comparisonText}>
                      {performanceData.milkYield.status} (avg: {performanceData.milkYield.avg} gal/day)
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Breed Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{cowDetails.breed} Breed Details</Text>
            <Text style={styles.description}>{insights?.description}</Text>
            
            <Text style={styles.sectionTitle}>Nutrition:</Text>
            <Text style={styles.sectionContent}>{insights?.nutritionTips}</Text>
            
            <Text style={styles.sectionTitle}>Milking:</Text>
            <Text style={styles.sectionContent}>{insights?.milkingRecommendations}</Text>
            
            <Text style={styles.sectionTitle}>Health Considerations:</Text>
            <Text style={styles.sectionContent}>{insights?.healthIssues}</Text>
          </Card.Content>
        </Card>

        {/* Health Tips Section */}
        <Text style={styles.healthTipsTitle}>Health Tips from AI</Text>
        
        <View style={styles.healthTipsGrid}>
          {insights?.healthTips.map((tip, index) => (
            <Card key={index} style={[styles.tipCard, { width: (screenWidth - 48) / 2 }]}>
              <Card.Content>
                <View style={styles.tipIconContainer}>
                  <Ionicons name={(tip.icon as any) || 'help-circle'} size={24} color="#666" />
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipContent}>{tip.content}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            style={styles.button}
            onPress={() => router.back()}
          >
            Back to Dashboard
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  card: {
    margin: 12,
    borderRadius: 12,
    elevation: 2,
  },
  cowDetailsContent: {
    paddingVertical: 16,
  },
  cowName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  breedName: {
    fontSize: 20,
    color: '#333',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metricColumn: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 16,
    color: '#666',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  comparisonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  healthTipsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  healthTipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  tipCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  buttonContainer: {
    marginVertical: 24,
    alignItems: 'center',
  },
  button: {
    width: '80%',
    borderRadius: 8,
  },
}); 