import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { sampleGaushaalas } from '@/lib/sample-gaushaalas';
import * as GCloudSQLService from '@/lib/gcloud-sql-service';
import * as Location from "expo-location";
import { DB_API_URL } from '@/config';

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

  // Fetch user's current location
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location permission is required to use this feature.");
          setIsLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Set the map's initial region to the user's current location
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user location:", error);
        setIsLoading(false);
      }
    };

    fetchUserLocation();
  }, []);


  // Function to fetch data from Google Cloud SQL
  
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  const handleMarkerPress = (location: LocationData) => {
    console.log("Selected Location:", location); // Debug log
    setSelectedLocation({
      ...location,
      distanceKm: location.distanceKm, // Ensure distanceKm is included
    });
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
    console.log("Applying filters:", { distance, cowBreed });
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

  const fetchLocationsWithRoles = async () => {
    try {
      setIsLoading(true);
  
      // Fetch data from the Flask API
      const response = await fetch(`${DB_API_URL}/get_locations_with_roles`);
      const data = await response.json();
  
      // Parse the response to extract latitude and longitude
      const parsedLocations = await Promise.all(
        data
          .filter((item: { location: string | null }) => item.location) // Exclude null locations
          .map(async (item: { location: string; role: string }, index: number) => {
            try {
              // Extract the `q` parameter from the URL
              const url = new URL(item.location);
              const query = url.searchParams.get("q");
    
              if (!query) {
                throw new Error("Invalid location format");
              }
    
              const [latitude, longitude] = query.split(",").map(Number);
    
              // Use reverse geocoding to get a human-readable address
              const address = await getReadableAddress(latitude, longitude);
    
              return {
                id: `${latitude},${longitude}-${index}`, // Append index to ensure uniqueness
                name: item.role || "Unknown Role", // Use role as the name
                address, // Use the human-readable address
                latitude,
                longitude,
                type: "role", // Add a type for filtering if needed
              };
            } catch (error) {
              console.error("Error parsing location:", item.location, error);
              return null; // Exclude invalid locations
            }
          })
      );
  
      // Remove null entries
      const validLocations = parsedLocations.filter((location) => location !== null);
  
      // Update state with the parsed locations
      setLocations(validLocations);
      setFilteredLocations(validLocations); // Initially, all locations are shown
  
      // Center the map on the first location if available
      if (validLocations.length > 0) {
        setRegion({
          latitude: validLocations[0].latitude,
          longitude: validLocations[0].longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error("Error fetching locations with roles:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Call this function when the component mounts
  useEffect(() => {
    fetchLocationsWithRoles();
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      console.log("Filtering locations...");
      console.log("Search Distance:", searchDistance);
      console.log("Region:", region);

      let filtered = [...locations];

      // Filter by distance if specified
      if (searchDistance !== null && region.latitude && region.longitude) {
        filtered = filtered.map((location) => {
          const distance = calculateDistance(
            region.latitude,
            region.longitude,
            location.latitude,
            location.longitude
          );
          console.log(`Distance to ${location.name}:`, distance); // Debug log
          return { ...location, distanceKm: distance }; // Assign the calculated distance
        }).filter((location) => location.distanceKm <= searchDistance);
      }

      // Filter by cow breed if specified
      if (searchCowBreed !== null && searchCowBreed !== "") {
        filtered = filtered.filter((location) =>
          location.name.toLowerCase().includes(searchCowBreed.toLowerCase())
        );
      }

      console.log("Filtered Locations:", filtered); // Debug log
      setFilteredLocations(filtered);
    }
  }, [locations, searchDistance, searchCowBreed, region]);

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
          region={region}
          showsUserLocation
          showsMyLocationButton
        >
          {filteredLocations.map((location) => (
            <Marker
              key={location.id} // Use the unique `id` field
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
              <ThemedText style={styles.infoDistance}>
                {selectedLocation.distanceKm.toFixed(2)} km away
              </ThemedText>
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

const getReadableAddress = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GMAPS_API_KEY; // Replace with your Google Maps API key
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address; // Return the first formatted address
    } else {
      console.error("Error with reverse geocoding:", data.status);
      return "Address not available";
    }
  } catch (error) {
    console.error("Error fetching readable address:", error);
    return "Address not available";
  }
};

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
    backgroundColor: 'white', // Ensure a visible background color
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Add elevation for Android
    borderWidth: 1, // Optional: Add a border for better visibility
    borderColor: '#E5E7EB', // Optional: Border color
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  infoTitle: {
    fontSize: 18, // Ensure a readable font size
    fontWeight: '600',
    color: '#333', // Ensure good contrast
    marginBottom: 4,
  },
  infoAddress: {
    fontSize: 14,
    color: '#555', // Slightly lighter color for secondary text
    marginBottom: 8,
  },
  infoDistance: {
    fontSize: 13,
    color: '#8B5CF6', // Highlight distance in a noticeable color
    marginBottom: 4,
  },
  infoBreed: {
    fontSize: 13,
    color: '#4B5563', // Ensure good contrast
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