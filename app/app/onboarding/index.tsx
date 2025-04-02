import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from 'lib/supabase'

export default function OnboardingScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')

  const handleFinish = async () => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return Alert.alert('Error', 'No user session found')

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      name,
      age: parseInt(age),
    })

    if (error) return Alert.alert('Error', error.message)
    router.replace('/home')
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="mb-6 text-2xl font-bold text-center">Tell us about you</Text>

      <TextInput
        className="p-4 mb-4 rounded-lg border"
        placeholder="Your name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="p-4 mb-4 rounded-lg border"
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TouchableOpacity
        className="p-4 bg-purple-600 rounded-lg"
        onPress={handleFinish}
      >
        <Text className="text-center text-white">Finish</Text>
      </TouchableOpacity>
    </View>
  )
}
