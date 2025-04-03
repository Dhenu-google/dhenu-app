import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase-config";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { DB_API_URL } from '@/config';
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTranslation } from "react-i18next";
import DhenuHeader from "@/components/DhenuHeader";

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
      const apiKey = process.env.EXPO_PUBLIC_GMAPS_API_KEY; 
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
      <DhenuHeader title={t('explore.strayCows', 'Stray Cows')} />
      
      <View style={styles.content}>
        <View style={styles.imageSection}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imageUploadContainer}>
              <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPicture}>
                <Ionicons name="cloud-upload" size={32} color="#000" />
                <Text style={styles.uploadText}>Upload Picture</Text>
              </TouchableOpacity>
              <Text style={styles.orText}>OR</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleClickPicture}>
                <Ionicons name="camera" size={32} color="#000" />
                <Text style={styles.uploadText}>Take a Picture</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.locationSection}>
          <ThemedText style={styles.sectionTitle}>Location Information</ThemedText>
          {location ? (
            <View style={styles.locationInfo}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color="#000" />
                <ThemedText style={styles.locationText}>
                  Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                </ThemedText>
              </View>
              {address && (
                <View style={styles.locationRow}>
                  <Ionicons name="home" size={20} color="#000" />
                  <ThemedText style={styles.addressText}>{address}</ThemedText>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.locationRow}>
              <ActivityIndicator size="small" color="#000" />
              <ThemedText style={styles.loadingText}>Fetching location...</ThemedText>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, (!image || !location || loading) && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={!image || !location || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Submit Report</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faebd7',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageUploadContainer: {
    borderWidth: 2,
    borderColor: '#5D4037',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#faebd7',
  },
  uploadButton: {
    alignItems: 'center',
    padding: 16,
  },
  uploadText: {
    marginTop: 8,
    fontSize: 16,
    color: '#5D4037',
  },
  orText: {
    marginVertical: 16,
    fontSize: 16,
    color: '#5D4037',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  locationSection: {
    backgroundColor: '#faebd7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#5D4037',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#5D4037',
  },
  locationInfo: {
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#5D4037',
  },
  addressText: {
    fontSize: 14,
    flex: 1,
    color: '#5D4037',
  },
  loadingText: {
    fontSize: 14,
    color: '#5D4037',
  },
  submitButton: {
    backgroundColor: '#5D4037',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});