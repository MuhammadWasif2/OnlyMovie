import React from 'react';
import { Text, View } from 'react-native';

const InfoBox = ({ title, subtitle, containerStyles, titleStyles }: {
    title: string | number;
    subtitle?: string;
    containerStyles?: string;
    titleStyles?: string;
}) => {
  return (
    <View className={containerStyles}>
      <Text className={`text-white text-center font-psemibold ${titleStyles}`}>{title}</Text>
      <Text className="text-sm text-gray-100 text-center font-pregular">{subtitle}</Text>
    </View>
  )
}

export default InfoBox 