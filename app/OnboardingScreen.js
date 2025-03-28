import React, { useRef, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const slides = [
  { id: '1', image: require('../assets/page1.png') },
  { id: '2', image: require('../assets/page2.png') },
  { id: '3', image: require('../assets/page3.png') },
  { id: '4', image: require('../assets/page3.png') },
];

const OnboardingScreen = () => {
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0); // Track the active slide index

  console.log('Active Slide:', activeSlide);

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop
        width={width - 50} // Make the carousel smaller
        height={height - 200} // Reduce the height of the carousel
        data={slides}
        scrollAnimationDuration={50}
        onSnapToItem={(index) => setActiveSlide(index)} // Update active slide when snapping
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} />
          </View>
        )}
      />
      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeSlide === index ? styles.activeDot : styles.inactiveDot, // Highlight active dot
            ]}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/sign-in')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pagination: {
    marginTop: 10, // Add spacing between the carousel and pagination
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: 'purple', // Ensure this is visually distinct
    width: 12, // Slightly larger for emphasis
    height: 12,
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
  button: {
    marginTop: 20, // Add spacing between the pagination and button
    backgroundColor: 'purple',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
