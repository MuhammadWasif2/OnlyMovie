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
import { useCallback, useEffect, useState } from "react";

const Index = () => {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useFetch(getTrendingMovies);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMovies = async (currentPage: number, isInitial = false) => {
    if (isInitial) {
      setMoviesLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const newMovies = await fetchMovies({ query: "", page: currentPage });
      if (newMovies.length > 0) {
        setMovies(prev => isInitial ? newMovies : [...prev, ...newMovies]);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      setMoviesError(err);
    } finally {
      if (isInitial) {
        setMoviesLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    loadMovies(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMovies(nextPage);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await Promise.all([refetchTrending(), loadMovies(1, true)]);
    setRefreshing(false);
  }, [refetchTrending]);

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

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-8">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };

  if (moviesLoading && movies.length === 0) {
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
        keyExtractor={(item, index) => `${item.id}-${index}`}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

export default Index;
