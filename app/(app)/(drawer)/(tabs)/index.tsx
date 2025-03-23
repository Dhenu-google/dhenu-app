import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image, Text as RNText, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Checkbox, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSession } from '@/context';
import { Ionicons } from '@expo/vector-icons';
import ChatbotButton from '@/components/ChatbotButton';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define cow data structure
interface CowStatus {
  label: string;
  type: string;
}

interface Cow {
  id: number;
  name: string;
  breed: string;
  age?: number;
  weight?: number;
  height?: number;
  milkYield?: number;
  origin?: string;
  status: CowStatus[];
  image: string;
  lastMilked: Date | null;
  lastFed: Date | null;
}

// New cow form data interface
interface NewCowForm {
  name: string;
  breed: string;
  age: string;
  weight: string;
  milkYield: string;
  height: string;
  origin: string;
}

// Initial empty form state
const initialFormState: NewCowForm = {
  name: '',
  breed: '',
  age: '',
  weight: '',
  milkYield: '',
  height: '',
  origin: ''
};

// Cow breeds with their origins
const breedOrigins: Record<string, string> = {
  'Gir': 'Gujarat, India',
  'Sahiwal': 'Punjab, Pakistan/India',
  'Guernsey': 'Guernsey, Channel Islands',
  'Holstein': 'Netherlands',
  'Jersey': 'Jersey, Channel Islands',
  'Brown Swiss': 'Switzerland',
  'Ayrshire': 'Scotland',
  'Angus': 'Scotland',
  'Hereford': 'England',
  'Brahman': 'India'
};

// Mock data for cows with status tags
const initialMockCows: Cow[] = [
  { 
    id: 1, 
    name: 'Bella', 
    breed: 'Gir',
    status: [
      { label: 'Needs Milking', type: 'milking' },
      { label: 'Needs Feeding', type: 'feeding' }
    ],
    image: 'https://cdn.pixabay.com/photo/2019/03/02/21/25/holstein-4030283_1280.jpg',
    lastMilked: null,
    lastFed: null
  },
  { 
    id: 2, 
    name: 'Daisy', 
    breed: 'Sahiwal',
    status: [
      { label: 'Needs Milking', type: 'milking' },
      { label: 'Needs Feeding', type: 'feeding' }
    ],
    image: 'https://cdn.pixabay.com/photo/2018/07/15/20/43/cow-3541348_1280.jpg',
    lastMilked: null,
    lastFed: null
  },
  { 
    id: 3, 
    name: 'Buttercup', 
    breed: 'Guernsey',
    status: [
      { label: 'Healthy', type: 'healthy' },
    ],
    image: 'https://cdn.pixabay.com/photo/2019/07/16/19/08/cow-4342764_1280.jpg',
    lastMilked: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    lastFed: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
];

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [mockCows, setMockCows] = useState<Cow[]>(initialMockCows);
  const [formVisible, setFormVisible] = useState(false);
  const [newCowForm, setNewCowForm] = useState<NewCowForm>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewCowForm, string>>>({});
  const { user } = useSession();
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  // Load cows from storage on initial load
  useEffect(() => {
    const loadCows = async () => {
      try {
        const savedCows = await AsyncStorage.getItem('cows');
        if (savedCows) {
          const parsed = JSON.parse(savedCows);
          // Convert string dates back to Date objects
          const cowsWithDates = parsed.map((cow: any) => ({
            ...cow,
            lastMilked: cow.lastMilked ? new Date(cow.lastMilked) : null,
            lastFed: cow.lastFed ? new Date(cow.lastFed) : null
          }));
          setMockCows(cowsWithDates);
        }
      } catch (error) {
        console.error('Failed to load cows from storage', error);
      }
    };
    
    loadCows();
  }, []);

  // Save cows to storage whenever they change
  useEffect(() => {
    const saveCows = async () => {
      try {
        await AsyncStorage.setItem('cows', JSON.stringify(mockCows));
      } catch (error) {
        console.error('Failed to save cows to storage', error);
      }
    };
    
    saveCows();
  }, [mockCows]);

  // Function to check if a cow needs milking or feeding (more than 3 hours)
  const checkCowNeeds = () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    
    setMockCows(prevCows => 
      prevCows.map(cow => {
        const needsMilking = !cow.lastMilked || cow.lastMilked < threeHoursAgo;
        const needsFeeding = !cow.lastFed || cow.lastFed < threeHoursAgo;
        
        // Create a new status array based on current needs
        let newStatus: CowStatus[] = [];
        
        if (needsMilking) {
          newStatus.push({ label: 'Needs Milking', type: 'milking' });
        }
        
        if (needsFeeding) {
          newStatus.push({ label: 'Needs Feeding', type: 'feeding' });
        }
        
        if (newStatus.length === 0) {
          newStatus.push({ label: 'Healthy', type: 'healthy' });
        }
        
        return { ...cow, status: newStatus };
      })
    );
  };

  // Check cow needs on initial load and every minute
  useEffect(() => {
    checkCowNeeds();
    const interval = setInterval(checkCowNeeds, 60000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    checkCowNeeds();
    // Simulate a refetch
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Handle marking a cow as milked
  const handleMarkMilked = (cowId: number, e: any) => {
    e.stopPropagation();
    const now = new Date();
    setMockCows(prevCows => 
      prevCows.map(cow => 
        cow.id === cowId ? { ...cow, lastMilked: now } : cow
      )
    );
    checkCowNeeds();
  };

  // Handle marking a cow as fed
  const handleMarkFed = (cowId: number, e: any) => {
    e.stopPropagation();
    const now = new Date();
    setMockCows(prevCows => 
      prevCows.map(cow => 
        cow.id === cowId ? { ...cow, lastFed: now } : cow
      )
    );
    checkCowNeeds();
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date | null) => {
    if (!timestamp) return 'Never';
    return format(timestamp, 'h:mm a');
  };

  // Helper function to determine tag background color
  const getTagColor = (type: string) => {
    switch (type) {
      case 'milking':
        return styles.milkingTag;
      case 'feeding':
        return styles.feedingTag;
      case 'healthy':
        return styles.healthyTag;
      default:
        return {};
    }
  };

  // Helper function to update new cow form
  const handleFormChange = (field: keyof NewCowForm, value: string) => {
    setNewCowForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    
    // Auto-fill origin if breed is known
    if (field === 'breed' && breedOrigins[value]) {
      setNewCowForm(prev => ({
        ...prev,
        origin: breedOrigins[value]
      }));
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof NewCowForm, string>> = {};
    
    if (!newCowForm.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!newCowForm.breed.trim()) {
      errors.breed = 'Breed is required';
    }
    
    // Parse numeric fields
    const age = parseFloat(newCowForm.age);
    const weight = parseFloat(newCowForm.weight);
    const milkYield = parseFloat(newCowForm.milkYield);
    const height = parseFloat(newCowForm.height);
    
    if (newCowForm.age && (isNaN(age) || age <= 0)) {
      errors.age = 'Age must be a positive number';
    }
    
    if (newCowForm.weight && (isNaN(weight) || weight <= 0)) {
      errors.weight = 'Weight must be a positive number';
    }
    
    if (newCowForm.milkYield && (isNaN(milkYield) || milkYield < 0)) {
      errors.milkYield = 'Milk yield must be a non-negative number';
    }
    
    if (newCowForm.height && (isNaN(height) || height <= 0)) {
      errors.height = 'Height must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle adding a new cow
  const handleAddCow = () => {
    if (!validateForm()) {
      return;
    }
    
    // Get a new unique ID (simple approach for mock data)
    const newId = Math.max(...mockCows.map(cow => cow.id), 0) + 1;
    
    // Determine origin from breed or use provided origin
    const origin = newCowForm.origin || breedOrigins[newCowForm.breed] || 'Unknown';
    
    // Generate a random cow image if needed
    const randomCowImages = [
      'https://cdn.pixabay.com/photo/2018/08/24/10/16/cow-3627798_1280.jpg',
      'https://cdn.pixabay.com/photo/2015/08/24/13/30/cow-905822_1280.jpg',
      'https://cdn.pixabay.com/photo/2019/07/21/08/23/cow-4352876_1280.jpg',
      'https://cdn.pixabay.com/photo/2017/07/12/09/41/white-park-cattle-2496577_1280.jpg',
    ];
    const randomImageUrl = randomCowImages[Math.floor(Math.random() * randomCowImages.length)];
    
    // Create a new cow object with complete profile data
    const newCow: Cow = {
      id: newId,
      name: newCowForm.name,
      breed: newCowForm.breed,
      age: newCowForm.age ? parseFloat(newCowForm.age) : undefined,
      weight: newCowForm.weight ? parseFloat(newCowForm.weight) : undefined,
      height: newCowForm.height ? parseFloat(newCowForm.height) : 145, // Default height if not provided
      milkYield: newCowForm.milkYield ? parseFloat(newCowForm.milkYield) : undefined,
      origin: origin,
      status: [{ label: 'Healthy', type: 'healthy' }],
      image: randomImageUrl,
      lastMilked: null,
      lastFed: null
    };
    
    // Add the new cow to the state
    setMockCows(prevCows => [...prevCows, newCow]);
    
    // Reset the form and close modal
    setNewCowForm(initialFormState);
    setFormVisible(false);
    
    // Show the newly created cow profile
    setTimeout(() => {
      router.push({
        pathname: '/cow-profile/[id]',
        params: { id: newId }
      });
    }, 500);
  };

  // Render the form modal
  const renderAddCowForm = () => (
    <Modal
      visible={formVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFormVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Add New Cow</Text>
            <TouchableOpacity onPress={() => setFormVisible(false)}>
              <Ionicons name="close-circle" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScrollView}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Name *</Text>
              <TextInput
                style={[styles.textInput, formErrors.name ? styles.inputError : null]}
                value={newCowForm.name}
                onChangeText={(text) => handleFormChange('name', text)}
                placeholder="Cow name"
              />
              {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Breed *</Text>
              <TextInput
                style={[styles.textInput, formErrors.breed ? styles.inputError : null]}
                value={newCowForm.breed}
                onChangeText={(text) => handleFormChange('breed', text)}
                placeholder="Cow breed"
              />
              {formErrors.breed && <Text style={styles.errorText}>{formErrors.breed}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Origin</Text>
              <TextInput
                style={styles.textInput}
                value={newCowForm.origin}
                onChangeText={(text) => handleFormChange('origin', text)}
                placeholder="Region/Country of origin"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Age (years)</Text>
              <TextInput
                style={[styles.textInput, formErrors.age ? styles.inputError : null]}
                value={newCowForm.age}
                onChangeText={(text) => handleFormChange('age', text)}
                placeholder="Cow age"
                keyboardType="numeric"
              />
              {formErrors.age && <Text style={styles.errorText}>{formErrors.age}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Weight (lbs)</Text>
              <TextInput
                style={[styles.textInput, formErrors.weight ? styles.inputError : null]}
                value={newCowForm.weight}
                onChangeText={(text) => handleFormChange('weight', text)}
                placeholder="Cow weight"
                keyboardType="numeric"
              />
              {formErrors.weight && <Text style={styles.errorText}>{formErrors.weight}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Height (cm)</Text>
              <TextInput
                style={[styles.textInput, formErrors.height ? styles.inputError : null]}
                value={newCowForm.height}
                onChangeText={(text) => handleFormChange('height', text)}
                placeholder="Cow height"
                keyboardType="numeric"
              />
              {formErrors.height && <Text style={styles.errorText}>{formErrors.height}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Daily Milk Yield (gal/day)</Text>
              <TextInput
                style={[styles.textInput, formErrors.milkYield ? styles.inputError : null]}
                value={newCowForm.milkYield}
                onChangeText={(text) => handleFormChange('milkYield', text)}
                placeholder="Daily milk production"
                keyboardType="numeric"
              />
              {formErrors.milkYield && <Text style={styles.errorText}>{formErrors.milkYield}</Text>}
            </View>

            <View style={styles.buttonContainer}>
              <Button 
                mode="contained" 
                onPress={handleAddCow}
                style={styles.submitButton}
              >
                Add Cow
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Cow list */}
        <View style={styles.cowGrid}>
          {mockCows.map((cow) => (
            <TouchableOpacity
              key={cow.id}
              style={styles.cowCard}
              onPress={() => {
                // @ts-ignore - workaround for navigation issues
                router.push({
                  pathname: '/cow-profile/[id]',
                  params: { id: cow.id }
                });
              }}
            >
              <View style={styles.cardContent}>
                <Image 
                  source={{ uri: cow.image }} 
                  style={styles.cowImage} 
                  resizeMode="cover"
                />
                <View style={styles.cowDetails}>
                  <Text style={styles.cowName}>{cow.name}</Text>
                  <Text style={styles.breedName}>{cow.breed}</Text>
                  <View style={styles.tagsContainer}>
                    {cow.status.map((status, index) => (
                      <View 
                        key={index} 
                        style={[styles.statusTag, getTagColor(status.type)]}
                      >
                        <Text style={styles.tagText}>{status.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              
              {/* Milking and Feeding Controls */}
              <View style={styles.actionsContainer}>
                {/* Milking section */}
                <View style={styles.actionSection}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={(e) => handleMarkMilked(cow.id, e)}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#000" />
                    <RNText style={styles.actionText}>Mark as Milked</RNText>
                  </TouchableOpacity>
                  <RNText style={styles.timestampText}>
                    Last: {formatTimestamp(cow.lastMilked)}
                  </RNText>
                </View>
                
                {/* Divider */}
                <View style={styles.actionDivider} />
                
                {/* Feeding section */}
                <View style={styles.actionSection}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={(e) => handleMarkFed(cow.id, e)}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#000" />
                    <RNText style={styles.actionText}>Mark as Fed</RNText>
                  </TouchableOpacity>
                  <RNText style={styles.timestampText}>
                    Last: {formatTimestamp(cow.lastFed)}
                  </RNText>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Add new cow button */}
          <TouchableOpacity
            style={styles.addCowCard}
            onPress={() => setFormVisible(true)}
          >
            <View style={styles.addIconContainer}>
              <Ionicons name="add-circle" size={44} color="#007AFF" />
              <Text style={styles.addCowText}>Add New Cow</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
      </View>
      
      <View style={styles.bottomDivider} />

      <ChatbotButton />

      {/* Render add cow form modal */}
      {renderAddCowForm()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80, // Reduced padding since news is removed
    paddingHorizontal: 8,
  },
  cowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  cowCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
    width: '47%', // Two columns with small margin
  },
  cardContent: {
    padding: 12,
    alignItems: 'center',
  },
  cowImage: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginBottom: 8,
  },
  cowDetails: {
    width: '100%',
  },
  cowName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  breedName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  milkingTag: {
    backgroundColor: '#ffebee', // light red/pink
  },
  feedingTag: {
    backgroundColor: '#fff8e1', // light yellow
  },
  healthyTag: {
    backgroundColor: '#e8f5e9', // light green
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomDivider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#000',
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 6,
  },
  actionSection: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  actionDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  actionText: {
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 11,
  },
  timestampText: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  addCowCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
    width: '47%', // Match the width of cow cards
    height: 160, // Match approximate height of cow cards
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCowText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  
  // Modal form styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formScrollView: {
    maxHeight: '90%',
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
  },
}); 