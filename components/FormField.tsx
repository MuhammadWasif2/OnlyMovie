import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { icons } from '../constants/icons';

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props } : {
    title: string;
    value: string;
    placeholder?: string;
    handleChangeText: (text: string) => void;
    otherStyles?: string;
    [x: string]: any;
}) => {
    const [showPassword, setShowPassword] = useState(false)

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-100 font-pmedium">{title}</Text>
      <View className="w-full h-16 px-4 bg-light-300 rounded-2xl border-2 border-black-200 focus:border-secondary flex-row items-center">
        <TextInput 
            className="flex-1 text-black font-psemibold text-base"
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#7b7b8b"
            onChangeText={handleChangeText}
            secureTextEntry={title === 'Password' && !showPassword}
            {...props}
        />

        {title === 'Password' && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image 
                    source={!showPassword ? icons.eye : icons.eyeHide}
                    className="w-6 h-6"
                    resizeMode='contain'
                />
            </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FormField 