import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '../../context/GlobalProvider';
import { getSavedMovies } from '../../services/appwrite';

type SavedMovie = {
    $id: string;
    movie_id: number;
    title: string;
    poster_path: string;
    release_date1: string;
}

const Saved = () => {
    const { user } = useGlobalContext();
    const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSaved = async () => {
            if (user) {
                setLoading(true);
                try {
                    const movies = await getSavedMovies(user.$id);
                    setSavedMovies(movies as unknown as SavedMovie[]);
                } catch (error) {
                    console.error("Failed to fetch saved movies:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setSavedMovies([]);
                setLoading(false);
            }
        };

        fetchSaved();
    }, [user]);

    if (loading) {
        return (
            <SafeAreaView className="bg-primary h-full justify-center items-center">
                <ActivityIndicator size="large" color="#FFFFFF" />
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView className="bg-primary h-full justify-center items-center px-4">
                <Text className="text-white text-xl text-center font-psemibold">Log in to see your saved movies</Text>
                <CustomButton 
                    title="Go to Sign In"
                    handlePress={() => router.push('/sign-in')}
                    containerStyles="w-full mt-7"
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="bg-primary h-full">
            <FlatList
                data={savedMovies}
                keyExtractor={(item) => item.movie_id.toString()}
                renderItem={({ item }: { item: SavedMovie }) => (
                    <TouchableOpacity 
                        className="flex-row items-center p-4 border-b border-gray-700"
                        onPress={() => router.push(`/movies/${item.movie_id}`)}
                    >
                        <Image 
                            source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                            className="w-16 h-24 rounded"
                            resizeMode="cover"
                        />
                        <View className="ml-4 flex-1">
                            <Text className="text-white font-psemibold text-lg">{item.title}</Text>
                            <Text className="text-gray-400 font-pregular mt-1">{item.release_date1}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListHeaderComponent={() => (
                    <Text className="text-white text-2xl font-psemibold m-4">Your Saved Movies</Text>
                )}
                ListEmptyComponent={() => (
                    <View className="justify-center items-center mt-20">
                        <Text className="text-gray-400 text-lg">You haven&apos;t saved any movies yet.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default Saved;