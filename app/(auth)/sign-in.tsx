import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Dimensions, Image, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import CustomButton from '../../components/CustomButton'
import FormField from '../../components/FormField'
import { images } from '../../constants/images'
import { useGlobalContext } from '../../context/GlobalProvider'
import { getCurrentUser, signIn } from '../../services/appwrite'

const SignIn = () => {
    const { setUser, setIsLoggedIn } = useGlobalContext();
    const [form, setForm] = useState({
        email: '',
        password: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submit = async () => {
        if (!form.email || !form.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);

        try {
            await signIn(form.email, form.password);
            const result = await getCurrentUser();
            
            if (result) {
                setUser(result);
                setIsLoggedIn(true);
                router.replace('/welcome');
            } else {
                Alert.alert('Error', 'Failed to get user data');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message)
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <SafeAreaView className="bg-primary h-full">
        <Image
            source={images.bg}
            className="absolute w-full h-full"
            resizeMode="cover"
        />
        <ScrollView>
            <View 
                className="w-full justify-center min-h-[85vh] px-4 my-6"
                style={{
                    minHeight: Dimensions.get("window").height - 100,
                }}
            >
                <Image 
                    source={images.logo}
                    resizeMode='contain'
                    className="w-[115px] h-[34px]"
                />
                <Text className="text-2xl text-white mt-10 font-psemibold">
                    Log in to OnlyMovie
                </Text>

                <FormField 
                    title="Email"
                    value={form.email}
                    handleChangeText={(e) => setForm({ ...form, email: e })}
                    otherStyles="mt-7"
                    keyboardType="email-address"
                />
                <FormField 
                    title="Password"
                    value={form.password}
                    handleChangeText={(e) => setForm({ ...form, password: e })}
                    otherStyles="mt-7"
                />

                <CustomButton 
                    title="Sign In"
                    handlePress={submit}
                    containerStyles="mt-7"
                    isLoading={isSubmitting}
                />

                <View className="justify-center pt-5 flex-row gap-2">
                    <Text className="text-lg text-light-200 font-pregular">
                        Don&apos;t have an account?
                    </Text>
                    <Link href="/sign-up" className='text-lg font-psemibold text-accent'>Sign Up</Link>
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn 