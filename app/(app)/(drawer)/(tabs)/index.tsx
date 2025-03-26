import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image, Text as RNText, Modal, TextInput, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
import { Text, Card, Checkbox, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSession } from '@/context';
import { Ionicons } from '@expo/vector-icons';
import ChatbotButton from '../../ChatbotButton';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { DB_API_URL } from '@/config';
import NotificationsModal from '@/app/(app)/notifications'; // Import the NotificationsModal component

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
  status: string;
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

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [newCowForm, setNewCowForm] = useState<NewCowForm>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewCowForm, string>>>({});
  // New states for breed filtering and view mode
  const [viewMode, setViewMode] = useState<'breeds'|'animals'|'details'>('breeds');
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Cow | null>(null);
  const [loadingBreeds, setLoadingBreeds] = useState(false); // State to track loading
  const [breeds, setBreeds] = useState<string[]>([]); // State to store breed options
  const [breedsOwned, setBreedsOwned] = useState<{ breed: string; count: number }[]>([]);
  const [loadingBreedsOwned, setLoadingBreedsOwned] = useState(false); // Track loading state
  // State to store cows of the selected breed
  const [cowsByBreed, setCowsByBreed] = useState<Cow[]>([]);
  const [loadingCows, setLoadingCows] = useState(false); // Track loading state for cows
  
  const { user } = useSession();
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  // Add new state for cow details and loading/error states
  const [cowDetails, setCowDetails] = useState<Cow | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false); // State to control modal visibility

  // Load cows from storage on initial load

  // Save cows to storage whenever they change

  // Function to check if a cow needs milking or feeding (more than 3 hours)


  // Check cow needs on initial load and every minute

  // Handle marking a cow as milked
  const handleMarkMilked = (cowId: number, event: any) => {
    console.log(`Marking cow with ID ${cowId} as milked.`);
    // Add any additional logic or UI feedback here if needed
  };

  // Handle marking a cow as fed
  const handleMarkFed = (cowId: number, event: any) => {
    console.log(`Marking cow with ID ${cowId} as fed.`);
    // Add any additional logic or UI feedback here if needed
  };

  // Handle pull-to-refresh action
  const onRefresh = () => {
    console.log('Refreshing data...');
    setRefreshing(true);

    // Simulate a delay for refreshing
    setTimeout(() => {
      console.log('Data refreshed.');
      setRefreshing(false);
    }, 1000); // Simulate a 1-second refresh delay
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
  const handleAddCow = async () => {
    if (!validateForm()) {
      return;
    }
  
    // Prepare the data to send to the backend
    const cowData = {
      name: newCowForm.name,
      breed: newCowForm.breed,
      birthDate: newCowForm.age
        ? new Date().getFullYear() - parseFloat(newCowForm.age) + "-01-01" // Calculate birth year from age
        : null,
      tagNumber: null, // Optional field, can be added to the form later
      notes: null, // Optional field, can be added to the form later
      owner_id: user?.uid, // Firebase Auth user ID (logged-in user's UID)
      milk_production: newCowForm.milkYield, // Daily milk production
    };
  
    try {
      const response = await fetch(`${DB_API_URL}/add_cow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cowData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error adding cow:', errorData.error);
        alert(`Failed to add cow: ${errorData.error}`);
        return;
      }
  
      const responseData = await response.json();
      console.log('Cow added successfully:', responseData);
  
      // Reset the form and close the modal
      setNewCowForm(initialFormState);
      setFormVisible(false);
  
      // Optionally, refresh the cow list or update the UI
      alert('Cow added successfully!');
    } catch (error) {
      console.error('Error adding cow:', error);
      alert('An error occurred while adding the cow. Please try again.');
    }
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
              <Ionicons name="close-circle" size={24} color="#333" />
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
                placeholderTextColor="#777"
              />
              {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Breed *</Text>
              {loadingBreeds ? (
                <Text>Loading breeds...</Text>
              ) : (
                <Picker
                  selectedValue={newCowForm.breed}
                  onValueChange={(itemValue) => {
                    handleFormChange('breed', itemValue);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a breed" value="" />
                  {breeds.map((breed, index) => (
                    <Picker.Item key={index} label={breed} value={breed} />
                  ))}
                </Picker>
              )}
              {formErrors.breed && <Text style={styles.errorText}>{formErrors.breed}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Origin</Text>
              <TextInput
                style={styles.textInput}
                value={newCowForm.origin}
                onChangeText={(text) => handleFormChange('origin', text)}
                placeholder="Region/Country of origin"
                placeholderTextColor="#777"
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
                placeholderTextColor="#777"
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
                placeholderTextColor="#777"
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
                placeholderTextColor="#777"
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
                placeholderTextColor="#777"
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


  // Function to fetch cows by breed
  const fetchCowsByBreed = async (breed: string) => {
    if (!user?.uid) {
      console.error('User UID is not available');
      return;
    }
  
    setLoadingCows(true);
    try {
      const response = await fetch(`${DB_API_URL}/get_cows_by_breed/${user.uid}/${breed}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cows by breed');
      }
      const data = await response.json();
      setCowsByBreed(data); // Update state with fetched cows
    } catch (error) {
      console.error('Error fetching cows by breed:', error);
    } finally {
      setLoadingCows(false);
    }
  };

  // Function to fetch cow details by name
  const fetchCowDetails = async (cowName: string) => {
    if (!user?.uid) {
      console.error('User UID is not available');
      return;
    }
  
    setLoadingDetails(true);
    setDetailsError(null);
  
    try {
      const response = await fetch(`${DB_API_URL}/get_cow_by_name/${user.uid}/${cowName}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cow details');
      }
  
      const data = await response.json();
      setCowDetails(data); // Update state with fetched cow details
    } catch (error: any) {
      console.error('Error fetching cow details:', error);
      setDetailsError(error.message || 'An error occurred while fetching cow details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle breed selection
  const handleBreedSelect = async (breed: string) => {
    setSelectedBreed(breed);
    setViewMode('animals');
    await fetchCowsByBreed(breed); // Fetch cows when a breed is selected
  };

  // Handle animal selection
  const handleAnimalSelect = async (cow: Cow) => {
    setSelectedAnimal(cow); // Keep the selected cow for reference
    setViewMode('details'); // Switch to 'details' view mode
    await fetchCowDetails(cow.name); // Fetch detailed information about the cow
  };

  // Handle back button
  const handleBackPress = () => {
    if (viewMode === 'details') {
      setViewMode('animals');
      setSelectedAnimal(null);
    } else if (viewMode === 'animals') {
      setViewMode('breeds');
      setSelectedBreed(null);
    }
  };

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      if (viewMode === 'details') {
        setViewMode('animals');
        setSelectedAnimal(null);
        return true; // Prevent default behavior (app closing)
      } else if (viewMode === 'animals') {
        setViewMode('breeds');
        setSelectedBreed(null);
        return true; // Prevent default behavior (app closing)
      }
      return false; // Let the default behavior happen (app closes or goes back in navigation)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Clean up the event listener
  }, [viewMode]); // Re-create when viewMode changes

  // Fetch breeds when the modal is opened
  useEffect(() => {
    const fetchBreeds = async () => {
      setLoadingBreeds(true);
      try {
        const response = await fetch(`${DB_API_URL}/get_breeds`); // Replace with your API URL
        if (!response.ok) {
          throw new Error('Failed to fetch breeds');
        }
        const data = await response.json();
        setBreeds(data); // Set the fetched breeds
      } catch (error) {
        console.error('Error fetching breeds:', error);
      } finally {
        setLoadingBreeds(false);
      }
    };

    if (formVisible) {
      fetchBreeds();
    }
  }, [formVisible]);

  useEffect(() => {
    const fetchBreedsOwned = async () => {
      if (!user?.uid) {
        console.error('User UID is not available');
        return;
      }
  
      setLoadingBreedsOwned(true);
      try {
        const response = await fetch(`${DB_API_URL}/get_cow_breeds_owned/${user.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch breeds owned by the user');
        }
        const data = await response.json();
        setBreedsOwned(data); // Set the fetched breeds and counts
      } catch (error) {
        console.error('Error fetching breeds owned:', error);
      } finally {
        setLoadingBreedsOwned(false);
      }
    };
  
    fetchBreedsOwned();
  }, [user?.uid]); // Fetch breeds when the user UID is available

  // Render the view based on viewMode
  const renderContent = () => {
    if (viewMode === 'breeds') {
      return (
        <View style={styles.contentContainer}>
          <ThemedText type="subtitle" style={styles.subtitle}>MY ANIMALS</ThemedText>
          <View style={styles.breedGrid}>
            {loadingBreedsOwned ? (
              <Text>Loading breeds...</Text>
            ) : (
              breedsOwned.map(({ breed, count }) => (
                <TouchableOpacity
                  key={breed}
                  style={styles.breedCard}
                  onPress={() => handleBreedSelect(breed)}
                >
                  <LinearGradient
                    colors={['#4C6EF5', '#3B5BDB', '#364FC7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.breedGradient}
                  >
                    <View style={styles.breedContent}>
                      <ThemedText style={styles.breedName}>{breed}</ThemedText>
                      <ThemedText style={styles.breedCount}>
                        {count} animals
                      </ThemedText>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            )}

            {/* Add new cow button */}
            <TouchableOpacity
              style={styles.addCowCard}
              onPress={() => setFormVisible(true)}
            >
              <LinearGradient
                colors={['#E7F0FD', '#CBE1FB', '#A4C9F9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addCowGradient}
              >
                <View style={styles.addIconContainer}>
                  <Ionicons name="add-circle" size={44} color="#4C6EF5" />
                  <ThemedText style={styles.addCowText}>Add New Cow</ThemedText>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    if (viewMode === 'animals') {
      return (
        <View style={styles.contentContainer}>
          <ThemedText type="subtitle" style={styles.subtitle}>SELECT ANIMAL</ThemedText>
          {loadingCows ? (
            <ActivityIndicator size="large" color="#4C6EF5" />
          ) : (
            <View style={styles.cowGrid}>
              {cowsByBreed.map((cow) => (
                <TouchableOpacity
                  key={cow.id}
                  style={styles.cowCard}
                  onPress={() => handleAnimalSelect(cow)}
                >
                  <View style={styles.cardContent}>
                    <Image 
                      source={{ uri: cow.image || 'https://via.placeholder.com/150' }} 
                      style={styles.cowImage} 
                      resizeMode="cover"
                    />
                    <View style={styles.cowDetails}>
                      <ThemedText style={styles.cowName}>{cow.name}</ThemedText>
                      <View style={styles.tagsContainer}>
                        {/* Render health status or other tags */}
                        <View style={[styles.statusTag, getTagColor(cow.status || 'healthy')]}>
                          <ThemedText style={styles.tagText}>{cow.status || 'Healthy'}</ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    }
    
    if (viewMode === 'details') {
      if (loadingDetails) {
        return (
          <View style={styles.detailsContainer}>
            <ActivityIndicator size="large" color="#4C6EF5" />
            <ThemedText style={styles.loadingText}>Loading cow details...</ThemedText>
          </View>
        );
      }
    
      if (detailsError) {
        return (
          <View style={styles.detailsContainer}>
            <ThemedText style={styles.errorText}>{detailsError}</ThemedText>
            <Button mode="contained" onPress={() => fetchCowDetails(selectedAnimal?.name || '')}>
              Retry
            </Button>
          </View>
        );
      }
    
      if (cowDetails) {
        return (
          <View style={styles.detailsContainer}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {/* Cow Profile */}
              <View style={styles.cowProfile}>
                <Image 
                  source={{ uri: cowDetails.image || 'https://via.placeholder.com/150' }} 
                  style={styles.detailsImage} 
                  resizeMode="cover"
                />
                <View style={styles.nameStatusContainer}>
                  <ThemedText type="subtitle" style={styles.detailsName}>{cowDetails.name}</ThemedText>
                  <ThemedText style={styles.detailsBreed}>{cowDetails.breed}</ThemedText>
                  
                  <View style={styles.detailsTagsContainer}>
                    {cowDetails.status ? (
                      <View style={[styles.statusTag, getTagColor(cowDetails.status)]}>
                        <ThemedText style={styles.tagText}>{cowDetails.status}</ThemedText>
                      </View>
                    ) : (
                      <ThemedText style={styles.noStatusText}>No status available</ThemedText>
                    )}
                  </View>
                </View>
              </View>
              
              {/* Cow Details */}
              <View style={styles.detailsCard}>
                <ThemedText type="defaultSemiBold" style={styles.detailsSectionTitle}>Status Information</ThemedText>
                <View style={styles.detailsRow}>
                  <ThemedText style={styles.detailsLabel}>Last Milked:</ThemedText>
                  <ThemedText style={styles.detailsValue}>{formatTimestamp(cowDetails.lastMilked)}</ThemedText>
                </View>
                <View style={styles.detailsRow}>
                  <ThemedText style={styles.detailsLabel}>Last Fed:</ThemedText>
                  <ThemedText style={styles.detailsValue}>{formatTimestamp(cowDetails.lastFed)}</ThemedText>
                </View>
                <View style={styles.detailsRow}>
                  <ThemedText style={styles.detailsLabel}>Age:</ThemedText>
                  <ThemedText style={styles.detailsValue}>{cowDetails.age || 'Unknown'}</ThemedText>
                </View>
                <View style={styles.detailsRow}>
                  <ThemedText style={styles.detailsLabel}>Weight:</ThemedText>
                  <ThemedText style={styles.detailsValue}>{cowDetails.weight || 'Unknown'} lbs</ThemedText>
                </View>
                <View style={styles.detailsRow}>
                  <ThemedText style={styles.detailsLabel}>Height:</ThemedText>
                  <ThemedText style={styles.detailsValue}>{cowDetails.height || 'Unknown'} cm</ThemedText>
                </View>
                <View style={styles.detailsRow}>
                  <ThemedText style={styles.detailsLabel}>Milk Yield:</ThemedText>
                  <ThemedText style={styles.detailsValue}>{cowDetails.milkYield || 'Unknown'} gal/day</ThemedText>
                </View>
                <View style={styles.detailsRow}>
                  <ThemedText style={styles.detailsLabel}>Origin:</ThemedText>
                  <ThemedText style={styles.detailsValue}>{cowDetails.origin || 'Unknown'}</ThemedText>
                </View>
              </View>
              
              {/* Actions */}
              <View style={styles.detailsActions}>
                <TouchableOpacity 
                  style={styles.detailsActionButton}
                  onPress={(e) => handleMarkMilked(cowDetails.id, e)}
                >
                  <LinearGradient
                    colors={['#4C6EF5', '#3B5BDB', '#364FC7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="water" size={20} color="#fff" />
                    <ThemedText style={styles.actionButtonText}>Mark as Milked</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.detailsActionButton}
                  onPress={(e) => handleMarkFed(cowDetails.id, e)}
                >
                  <LinearGradient
                    colors={['#4C6EF5', '#3B5BDB', '#364FC7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="restaurant" size={20} color="#fff" />
                    <ThemedText style={styles.actionButtonText}>Mark as Fed</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
                
                
              </View>
            </ScrollView>
          </View>
        );
      }
    
      return null; // If no cow details are available
    }
    
    return null;
  };

  return (
    <ThemedView style={styles.container} lightColor="#ffffff" darkColor="#ffffff">
      {/* Dashboard Header */}
      <View style={styles.header}>
        {viewMode !== 'breeds' && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
        )}
        <ThemedText type="title" style={styles.title}>
          {viewMode === 'breeds' ? 'Dashboard' : 
           viewMode === 'animals' ? selectedBreed : 
           selectedAnimal?.name}
        </ThemedText>

        {/* Notifications Button */}
        <TouchableOpacity
          onPress={() => setNotificationsVisible(true)}
          style={styles.notificationsButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>

      <View style={styles.bottomNav}></View>
      <View style={styles.bottomDivider}></View>

      <ChatbotButton />

      {/* Render add cow form modal */}
      {renderAddCowForm()}

      {/* Notifications Modal */}
      {notificationsVisible && (
        <NotificationsModal 
          modalVisible={notificationsVisible} 
          setModalVisible={setNotificationsVisible} 
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#8B5CF6', // Lavender color
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
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
    color: '#000',
  },
  breedName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
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
    backgroundColor: '#FFCDD2', // darker light red/pink
  },
  feedingTag: {
    backgroundColor: '#FFE082', // darker light yellow
  },
  healthyTag: {
    backgroundColor: '#C8E6C9', // darker light green
  },
  criticalTag: {
    backgroundColor: '#FFCDD2', // Light red for critical status
  },
  needsAttentionTag: {
    backgroundColor: '#FFE082', // Light yellow for needs attention
  },
  defaultTag: {
    backgroundColor: '#E0E0E0', // Light gray for unknown statuses
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333', // darker text color
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
    height: 1,
    backgroundColor: '#F0F0F0',
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
    color: '#000',
  },
  timestampText: {
    fontSize: 9,
    color: '#333',
    marginTop: 2,
  },
  addCowCard: {
    width: '48%',
    height: 150,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addCowGradient: {
    width: '100%',
    height: '100%',
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
    color: '#0D47A1',
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
    color: '#333',
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
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
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
  contentContainer: {
    padding: 16,
  },
  subtitle: { 
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    fontWeight: '500'
  },
  breedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  breedCard: {
    width: '48%',
    height: 150,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  breedGradient: {
    width: '100%',
    height: '100%',
  },
  breedContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  breedCount: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  cowProfile: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailsImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  nameStatusContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailsBreed: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  detailsTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailsSectionTitle: {
    fontSize: 18,
    color: '#8B5CF6',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailsLabel: {
    fontSize: 14,
    color: '#333',
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000', // Black text color for darker appearance
  },
  detailsActions: {
    marginTop: 8,
  },
  detailsActionButton: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  noStatusText: {
    fontSize: 14,
    color: '#999',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  notificationsButton: {
    position: 'absolute',
    right: 20, // Align to the right
    top: 16, // Align vertically with the header
  },
});