import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase-config"; // Adjust the path as needed
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { DB_API_URL } from '@/config';
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTranslation } from "react-i18next";

export default function StrayCows() {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch user location and convert it to a human-readable address
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to fetch your location.');
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;

      setLocation({ latitude, longitude });

      // Use Google Maps Geocoding API to get a human-readable address
      const apiKey = process.env.EXPO_PUBLIC_GMAPS_API_KEY; // Replace with your Google Maps API key
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      console.error('Failed to fetch location:', error);
      Alert.alert('Error', 'Unable to fetch location. Please enable location services.');
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  // Handle image selection from gallery
  const handleUploadPicture = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission is required to access the gallery.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to upload picture:', error);
      Alert.alert('Error', 'Unable to upload picture. Please try again.');
    }
  };

  // Handle image selection from camera
  const handleClickPicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission is required to access the camera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Error', 'Unable to take picture. Please try again.');
    }
  };

  const handleSubmit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "You must be logged in to upload an image.");
      return;
    }

    if (!image || !location) {
      Alert.alert("Error", "Please upload or take a picture and ensure location is available.");
      return;
    }

    setLoading(true); // Start loading

    try {
      // Upload the image to Firebase Storage
      const response = await fetch(image);
      const blob = await response.blob();
      const filename = `stray-cows/${user.uid}/${Date.now()}.jpg`; // Unique filename per user
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);

      // Save metadata to Firestore
      const db = getFirestore();
      const metadata = {
        imageUrl,
        location, // { latitude, longitude }
        address,
        timestamp: Timestamp.now(),
        userId: user.uid, // Associate the image with the logged-in user
      };

      await addDoc(collection(db, "strayCows"), metadata);
 
      try {
        console.log("Data being sent to notify nearby users:", {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 10,
        });

        const response = await fetch(`${DB_API_URL}/notify_nearby_users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
            radius: 10,
            image_url:imageUrl, 
          }),
        });

        // Log the raw response for debugging
        const responseText = await response.text();
        console.log("Raw response:", responseText);

        if (!response.ok) {
          console.error("Failed to notify nearby users:", responseText);
          Alert.alert("Error", "Failed to notify nearby users. Please try again.");
          return;
        }

        // Parse the response as JSON if it's valid
        const responseData = JSON.parse(responseText);
        console.log("Successfully notified nearby users:", responseData);
      } catch (error) {
        console.error("Error notifying nearby users:", error);
        Alert.alert("Error", "An error occurred while notifying nearby users. Please try again.");
      }

      Alert.alert("Success", "Image and location saved successfully!");
      console.log("Image URL:", imageUrl);
      console.log("Location:", location);
      console.log("Address:", address);

      // Reset the form
      setImage(null);
      setLocation(null);
      setAddress(null);
    } catch (error) {
      console.error("Error submitting data:", error);
      Alert.alert("Error", "Failed to submit data. Please try again.");
    } finally {
      setLoading(false); // Stop loading
      fetchLocation();
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            {t('explore.strayCows', 'Report Stray Cows')}
          </ThemedText>
        </View>
      </View>

      {/* Dotted Box for Image Selection */}
      <View style={styles.cardContainer}>
        <View style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <>
              <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPicture}>
                <Ionicons name="cloud-upload-outline" size={24} color="#4C6EF5" />
                <Text style={styles.buttonText}>Upload Picture</Text>
              </TouchableOpacity>
              <Text style={styles.orText}>OR</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleClickPicture}>
                <Ionicons name="camera-outline" size={24} color="#4C6EF5" />
                <Text style={styles.buttonText}>Take a Picture</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Location Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Location Information</Text>
          {location ? (
            <>
              <View style={styles.locationItem}>
                <Ionicons name="location-outline" size={20} color="#4C6EF5" />
                <Text style={styles.locationText}>
                  Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                </Text>
              </View>
              {address && (
                <View style={styles.locationItem}>
                  <Ionicons name="home-outline" size={20} color="#4C6EF5" />
                  <Text style={styles.addressText}>{address}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.locationItem}>
              <ActivityIndicator size="small" color="#4C6EF5" />
              <Text style={styles.loadingText}>Fetching location...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={!image || !location || loading}
      >
        <LinearGradient
          colors={['#E53E3E', '#C53030', '#9B2C2C']}
          style={styles.gradientButton}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send-outline" size={20} color="#FFFFFF" style={styles.submitIcon} />
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  backButton: {
    padding: 4,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageBox: {
    borderWidth: 1,
    borderColor: '#E8EFFF',
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#FAFBFF',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EFF3FF',
  },
  buttonText: {
    color: '#4C6EF5',
    fontWeight: '500',
    marginLeft: 8,
  },
  orText: {
    marginVertical: 12,
    color: '#666',
    fontWeight: '500',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  infoContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8,
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8,
    flex: 1,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  submitButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  gradientButton: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitIcon: {
    marginRight: 8,
  },
});