import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Dimensions, Image, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import CustomButton from '../../components/CustomButton'
import FormField from '../../components/FormField'
import { images } from '../../constants/images'
import { useGlobalContext } from '../../context/GlobalProvider'
import { createUser } from '../../services/appwrite'

const SignUp = () => {
    const { setUser, setIsLoggedIn } = useGlobalContext();
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submit = async () => {
        if (!form.username || !form.email || !form.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        // Password validation
        if (form.password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return;
        }

        // Check for common passwords
        const commonPasswords = ['password', '123456', '12345678', 'qwerty', 'abc123'];
        if (commonPasswords.includes(form.password.toLowerCase())) {
            Alert.alert('Error', 'Please choose a stronger password');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createUser(form.email, form.password, form.username);
            setUser(result);
            setIsLoggedIn(true);

            router.replace('/welcome');
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
                    Sign up to OnlyMovie
                </Text>

                <FormField 
                    title="Username"
                    value={form.username}
                    handleChangeText={(e) => setForm({ ...form, username: e })}
                    otherStyles="mt-10"
                />
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
                    title="Sign Up"
                    handlePress={submit}
                    containerStyles="mt-7"
                    isLoading={isSubmitting}
                />

                <View className="justify-center pt-5 flex-row gap-2">
                    <Text className="text-lg text-light-200 font-pregular">
                        Have an account already?
                    </Text>
                    <Link href="/sign-in" className='text-lg font-psemibold text-accent'>Sign In</Link>
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp 