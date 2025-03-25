import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export default function StrayCows() {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);

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

  const handleSubmit = () => {
    if (!image || !location) {
      Alert.alert('Error', 'Please upload or take a picture and ensure location is available.');
      return;
    }

    Alert.alert('Success', 'Form submitted successfully!');
    console.log('Image:', image);
    console.log('Location:', location);
    console.log('Address:', address);
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Report Stray Cows</Text>

      {/* Dotted Box for Image Selection */}
      <View style={styles.imageBox}>
        <TouchableOpacity onPress={handleUploadPicture}>
          <Text style={styles.imageBoxText}>Upload Picture</Text>
        </TouchableOpacity>
        <Text style={styles.orText}>OR</Text>
        <TouchableOpacity onPress={handleClickPicture}>
          <Text style={styles.imageBoxText}>Take a Picture</Text>
        </TouchableOpacity>
      </View>

      {/* Image Preview */}
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      {/* Location */}
      {location ? (
        <Text style={styles.locationText}>
          Location: Latitude {location.latitude}, Longitude {location.longitude}
        </Text>
      ) : (
        <Text style={styles.locationText}>Fetching location...</Text>
      )}

      {/* Address */}
      {address && <Text style={styles.addressText}>Address: {address}</Text>}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  imageBox: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderStyle: 'dashed',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  imageBoxText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  orText: {
    fontSize: 14,
    color: '#999',
    marginVertical: 10,
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  addressText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});