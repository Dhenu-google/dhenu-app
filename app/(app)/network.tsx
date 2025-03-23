import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { sampleGaushaalas } from '@/lib/sample-gaushaalas';
import * as GCloudSQLService from '@/lib/gcloud-sql-service';

// Define types for location data
interface LocationData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  phone?: string;
  cowBreed?: string;
  distanceKm?: number;
}

export default function NetworkScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>([]);
  const [searchDistance, setSearchDistance] = useState<number | null>(null);
  const [searchCowBreed, setSearchCowBreed] = useState<string | null>(null);
  const [region, setRegion] = useState({
    latitude: 12.9716,  // Default to Bangalore, India
    longitude: 77.5946,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Fetch location data 
  useEffect(() => {
    // For initial testing, use the sample data
    if (__DEV__) {
      // Use sample data for development
      const timer = setTimeout(() => {
        setLocations(sampleGaushaalas);
        setFilteredLocations(sampleGaushaalas);
        
        // If we have locations, center the map on the first one
        if (sampleGaushaalas.length > 0) {
          setRegion({
            latitude: sampleGaushaalas[0].latitude,
            longitude: sampleGaushaalas[0].longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
        
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // In production, fetch from Google Cloud SQL
      fetchGaushaalasFromSQL();
    }
  }, []);
  
  // Function to fetch data from Google Cloud SQL
  const fetchGaushaalasFromSQL = async () => {
    try {
      setIsLoading(true);
      
      let data: LocationData[] = [];
      
      // Apply filtering based on current criteria
      if (searchDistance !== null) {
        data = await GCloudSQLService.fetchGaushaalasByDistance(searchDistance);
      } else if (searchCowBreed !== null && searchCowBreed !== '') {
        data = await GCloudSQLService.fetchGaushaalasByBreed(searchCowBreed);
      } else {
        data = await GCloudSQLService.fetchGaushaalas();
      }
      
      setLocations(data);
      setFilteredLocations(data);
      
      // If we have locations, center the map on the first one
      if (data.length > 0) {
        setRegion({
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error fetching locations from SQL:', error);
      // Fallback to sample data if there's an error
      setLocations(sampleGaushaalas);
      setFilteredLocations(sampleGaushaalas);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the location data when filter criteria change
  useEffect(() => {
    if (!isLoading && !__DEV__) {
      fetchGaushaalasFromSQL();
    }
  }, [searchDistance, searchCowBreed]);

  // Filter locations based on search criteria (only needed for dev mode with sample data)
  useEffect(() => {
    if (__DEV__ && locations.length > 0) {
      let filtered = [...locations];

      // Filter by distance if specified
      if (searchDistance !== null) {
        filtered = filtered.filter(location => 
          location.distanceKm !== undefined && location.distanceKm <= searchDistance
        );
      }

      // Filter by cow breed if specified
      if (searchCowBreed !== null && searchCowBreed !== '') {
        filtered = filtered.filter(location => 
          location.cowBreed !== undefined && 
          location.cowBreed.toLowerCase().includes(searchCowBreed.toLowerCase())
        );
      }

      setFilteredLocations(filtered);
    }
  }, [locations, searchDistance, searchCowBreed, __DEV__]);

  const handleMarkerPress = (location: LocationData) => {
    setSelectedLocation(location);
  };

  const closeInfoWindow = () => {
    setSelectedLocation(null);
  };

  const openDirections = (location: LocationData) => {
    const { latitude, longitude } = location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const callLocation = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const applyFilters = (distance: number | null, cowBreed: string | null) => {
    setSearchDistance(distance);
    setSearchCowBreed(cowBreed);
  };

  // Search options component
  const renderSearchOptions = () => (
    <View style={styles.searchOptions}>
      <View style={styles.searchRow}>
        <TouchableOpacity 
          style={[styles.distanceOption, searchDistance === 10 && styles.activeOption]}
          onPress={() => applyFilters(10, searchCowBreed)}
        >
          <Text style={styles.optionText}>Within 10 kms</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.distanceOption, searchDistance === 15 && styles.activeOption]}
          onPress={() => applyFilters(15, searchCowBreed)}
        >
          <Text style={styles.optionText}>Within 15 kms</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.distanceOption, searchDistance === null && styles.activeOption]}
          onPress={() => applyFilters(null, searchCowBreed)}
        >
          <Text style={styles.optionText}>All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <ThemedText style={styles.loadingText}>Loading map...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Gaushaala Network</ThemedText>
      </View>
      
      {renderSearchOptions()}
      
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton
        >
          {filteredLocations.map((location) => (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={location.name}
              description={location.address}
              onPress={() => handleMarkerPress(location)}
              pinColor="#8B5CF6"
            />
          ))}
        </MapView>
        
        {selectedLocation && (
          <View style={styles.infoWindow}>
            <TouchableOpacity style={styles.closeButton} onPress={closeInfoWindow}>
              <Ionicons name="close-circle" size={24} color="#8B5CF6" />
            </TouchableOpacity>
            
            <ThemedText style={styles.infoTitle}>{selectedLocation.name}</ThemedText>
            <ThemedText style={styles.infoAddress}>{selectedLocation.address}</ThemedText>
            
            {selectedLocation.distanceKm && (
              <ThemedText style={styles.infoDistance}>{selectedLocation.distanceKm} km away</ThemedText>
            )}
            
            {selectedLocation.cowBreed && (
              <ThemedText style={styles.infoBreed}>Cow Breed: {selectedLocation.cowBreed}</ThemedText>
            )}
            
            <View style={styles.buttonContainer}>
              {selectedLocation.phone && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => callLocation(selectedLocation.phone!)}
                >
                  <Ionicons name="call" size={20} color="white" />
                  <Text style={styles.buttonText}>Call</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => openDirections(selectedLocation)}
              >
                <Ionicons name="navigate" size={20} color="white" />
                <Text style={styles.buttonText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
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
    color: '#8B5CF6',
  },
  searchOptions: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  distanceOption: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeOption: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 12,
    color: '#4B5563',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoWindow: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  infoDistance: {
    fontSize: 13,
    color: '#8B5CF6',
    marginBottom: 4,
  },
  infoBreed: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
  },
}); 