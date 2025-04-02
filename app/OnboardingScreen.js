import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const slides = [
  { id: '1', image: require('../assets/page1.png') },
  { id: '2', image: require('../assets/page2.png') },
  { id: '3', image: require('../assets/page3.png') },
];

const OnboardingScreen = () => {
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const nextSlide = (activeSlide + 1) % slides.length;
        carouselRef.current.scrollTo({ index: nextSlide, animated: true });
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      StatusBar.setBarStyle('default');
    };
  }, [activeSlide]);

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        data={slides}
        scrollAnimationDuration={1000}
        onSnapToItem={(index) => setActiveSlide(index)}
        renderItem={({ item }) => (
          <Animated.View 
            entering={FadeIn.duration(800)}
            style={styles.slide}
          >
            <Image 
              source={item.image} 
              style={styles.image}
            />
          </Animated.View>
        )}
      />

      {/* Overlay container for dots and button */}
      <View style={styles.overlayContainer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(index * 200)}
              style={[
                styles.dot,
                activeSlide === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/sign-in')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#000', // Dark background for better full-screen experience
  },
  slide: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resizeMode: 'cover', // Changed to cover for full-screen effect
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent overlay
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeDot: {
    backgroundColor: '#fff',
    transform: [{ scale: 1.2 }],
    width: 12,
    height: 12,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  button: {
    backgroundColor: '#5D4037',
    marginHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default OnboardingScreen;
