import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { images } from '../constants/images';

const Welcome = () => {
    // Get screen width for positioning
    const screenWidth = Dimensions.get('window').width;

    // Animation values
    const slideAnim = useRef(new Animated.Value(-screenWidth)).current; // Start off-screen left
    const fadeAnim = useRef(new Animated.Value(0)).current; // Start transparent

    useEffect(() => {
        // Navigate to the main app after 2.5 seconds
        const timer = setTimeout(() => {
            router.replace('/(tabs)');
        }, 2500);

        // Start the animation sequence
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0, // Slide to center
                duration: 1000,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1, // Fade in
                duration: 1200,
                useNativeDriver: true,
            })
        ]).start();

        // Cleanup the timer if the component unmounts
        return () => clearTimeout(timer);
    }, []);

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="w-full justify-center items-center h-full px-4">
        <Animated.View style={{ transform: [{ translateX: slideAnim }], opacity: fadeAnim }}>
            <Image 
              source={images.logo}
              resizeMode='contain'
              className="w-[130px] h-[84px]"
            />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
            <Text className="text-3xl text-white font-bold text-center mt-5">
                Welcome to <Text className="text-secondary">Movie App</Text>
            </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome; 