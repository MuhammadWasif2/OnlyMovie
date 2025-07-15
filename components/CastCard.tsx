import React from 'react';
import { Image, Text, View } from 'react-native';

const CastCard = ({ castMember }: { castMember: CastMember }) => {
  const imageUrl = castMember.profile_path
    ? `https://image.tmdb.org/t/p/w200${castMember.profile_path}`
    : 'https://via.placeholder.com/200x300.png?text=No+Image';

  return (
    <View className="flex-col items-center mr-4 w-28">
      <Image
        source={{ uri: imageUrl }}
        className="w-24 h-24 rounded-full"
        resizeMode="cover"
      />
      <Text className="text-white text-sm mt-2 text-center" numberOfLines={2}>
        {castMember.name}
      </Text>
      <Text className="text-gray-400 text-xs text-center" numberOfLines={2}>
        {castMember.character}
      </Text>
    </View>
  );
};

export default CastCard; 