import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from 'react-native-webview';
  
import CastCard from "@/components/CastCard";
import { icons } from "@/constants/icons";
import { fetchMovieCredits, fetchMovieDetails, fetchMovieTrailers } from "@/services/api";
import useFetch from "@/services/useFetch";
import { useGlobalContext } from '../../context/GlobalProvider';
import { getSavedMovies, saveMovie, unsaveMovie } from '../../services/appwrite';
  
type SavedMovie = {
  $id: string;
  movie_id: number;
}

const config = {
  // ...existing config
  savedMoviesCollectionId: "YOUR_SAVED_MOVIES_COLLECTION_ID",
};
  
interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}
  
const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);
  
const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const { user } = useGlobalContext();
  const [savedMovies, setSavedMovies] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [savedDocId, setSavedDocId] = useState<string | null>(null);

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  const { data: trailers } = useFetch(() =>
    fetchMovieTrailers(id as string)
  );

  const { data: cast, loading: castLoading } = useFetch(() => 
      fetchMovieCredits(id as string)
  );

  useEffect(() => {
    if (user && movie) {
      getSavedMovies(user.$id).then((savedMovies) => {
        const found = savedMovies.find((m) => m.movie_id === movie.id);
        if (found) {
          setIsSaved(true);
          setSavedDocId(found.$id);
        }
      });
    }
  }, [user, movie]);

  const handlePlayTrailer = () => {
      if (trailers && trailers.length > 0) {
          setIsTrailerPlaying(true);
      }
  };

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1">
        <ActivityIndicator />
      </SafeAreaView>
    );

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} className="bg-primary">
        {/* Poster or Trailer Section */}
        <View>
          {isTrailerPlaying && trailers && trailers.length > 0 ? (
              <View className="w-full h-[550px]">
                  <WebView
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      allowsFullscreenVideo={true}
                      source={{ uri: `https://www.youtube.com/embed/${trailers[0].key}?autoplay=1&rel=0` }}
                      className="flex-1 bg-black"
                  />
                  <TouchableOpacity
                      className="absolute top-5 right-5 bg-dark-200/80 rounded-full p-2 z-10"
                      onPress={() => setIsTrailerPlaying(false)}
                  >
                      <Text className="text-white text-lg px-2">Close</Text>
                  </TouchableOpacity>
              </View>
          ) : (
              <View className="relative">
                  <Image
                      source={{
                          uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
                      }}
                      className="w-full h-auto"
                      style={{ aspectRatio: 2 / 3 }}
                      resizeMode="cover"
                  />
                  {trailers && trailers.length > 0 && (
                      <View className="absolute bottom-5 right-5 flex-row gap-x-4">
                        <TouchableOpacity 
                          className="rounded-full size-14 bg-white flex items-center justify-center"
                          onPress={handlePlayTrailer}
                        >
                          <Image
                              source={icons.play}
                              className="w-6 h-7 ml-1"
                              resizeMode="stretch"
                          />
                        </TouchableOpacity>
                      </View>
                  )}
                  {user && (
                    <TouchableOpacity
                      className="absolute bottom-5 left-5 rounded-full size-14 bg-dark-100/80 flex items-center justify-center"
                      onPress={async () => {
                        if (!user) return; // Or prompt to login
                        if (isSaved && savedDocId) {
                          await unsaveMovie(savedDocId);
                          setIsSaved(false);
                          setSavedDocId(null);
                        } else {
                          const doc = await saveMovie(user.$id, movie);
                          setIsSaved(true);
                          setSavedDocId(doc.$id);
                        }
                      }}
                    >
                      <Image
                        source={icons.save}
                        className="w-7 h-7"
                        resizeMode="contain"
                        tintColor={isSaved ? '#AB8BFF' : '#FFFFFF'} // Accent color when saved
                      />
                    </TouchableOpacity>
                  )}
              </View>
          )}
        </View>
          
        {/* Movie Details Section */}
        <View className="mt-8 px-5">
          <Text className="text-white font-bold text-2xl">{movie?.title}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]} •
            </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />

            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>

            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round(
                (movie?.revenue ?? 0) / 1_000_000
              )} million`}
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name).join(" • ") ||
              "N/A"
            }
          />

          {/* Cast Section */}
          {cast && cast.length > 0 && (
              <View className="mt-8">
                  <Text className="text-white font-bold text-xl mb-4">Cast</Text>
                  <FlatList
                      data={cast}
                      renderItem={({ item }) => <CastCard castMember={item} />}
                      keyExtractor={(item) => item.id.toString()}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                  />
              </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};
  
export default Details;