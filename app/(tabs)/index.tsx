import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";

import TrendingCard from "@/components/TrendingCard";
import { useCallback, useState } from "react";

const Index = () => {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useFetch(getTrendingMovies);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: refetchMovies,
  } = useFetch(() => fetchMovies({ query: "" }));

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTrending(), refetchMovies()]);
    setRefreshing(false);
  }, [refetchTrending, refetchMovies]);

  const renderHeader = () => (
    <View className="w-full mt-20">
      <View className="flex-row justify-center items-center">
        <Image source={icons.logo} className="w-12 h-10" />
      </View>

      <View className="my-5">
        <SearchBar
          onPress={() => router.push("/search")}
          placeholder="Search for a movie"
        />
      </View>

      {trendingMovies && (
        <View className="mt-6">
          <Text className="text-lg text-white font-bold mb-3">
            Trending Movies
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={trendingMovies}
            renderItem={({ item, index }) => (
              <TrendingCard movie={item} index={index} />
            )}
            keyExtractor={(item) => item.movie_id.toString()}
            contentContainerStyle={{ gap: 26 }}
            ItemSeparatorComponent={() => <View className="w-4" />}
          />
        </View>
      )}

      <Text className="text-lg text-white font-bold mt-10 mb-3">
        Latest Movies
      </Text>
    </View>
  );

  if (moviesLoading || trendingLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (moviesError || trendingError) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <Text className="text-red-500">
          Error: {moviesError?.message || trendingError?.message}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        className="px-5"
        data={movies}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      />
    </View>
  );
};

export default Index;
