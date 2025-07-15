import { router } from "expo-router";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InfoBox from "../../components/InfoBox";
import { useGlobalContext } from "../../context/GlobalProvider";
import { signOut } from "../../services/appwrite";

type Post = {
    $id: string;
}

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();

  const logout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              setUser(null);
              setIsLoggedIn(false);
              router.replace("/sign-in");
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="w-full justify-center items-center mt-6 mb-12 px-4">
        {/* Header with Sign Out Button */}
        <View className="w-full flex-row justify-between items-center mb-10">
          <Text className="text-2xl text-white font-psemibold">Profile</Text>
          <TouchableOpacity
            onPress={logout}
            className="bg-secondary px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-pmedium">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* User Avatar */}
        <View className="w-20 h-20 border border-secondary rounded-full justify-center items-center mb-4">
          <Image
            source={{ uri: user?.avatar }}
            className="w-[90%] h-[90%] rounded-full"
            resizeMode="cover"
          />
        </View>

        {/* User Info */}
        <InfoBox
          title={user?.username || "User"}
          subtitle="Username"
          containerStyles="mb-4"
          titleStyles="text-xl"
        />

        {/* Additional Profile Info */}
        <View className="w-full bg-secondary/20 rounded-xl p-4 mt-6">
          <Text className="text-white font-psemibold text-lg mb-2">Account Info</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-300">Account ID:</Text>
              <Text className="text-white font-pmedium">{user?.accountId || "N/A"}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-300">Member Since:</Text>
              <Text className="text-white font-pmedium">
                {user?.$createdAt ? new Date(user.$createdAt).toLocaleDateString() : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Placeholder for future features */}
        <View className="w-full mt-8">
          <Text className="text-gray-400 text-center font-pregular">
            More profile features coming soon...
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;