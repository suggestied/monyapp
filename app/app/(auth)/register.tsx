import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from 'lib/supabase'

export default function RegisterScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) return Alert.alert('Registration failed', error.message)
    router.replace('/onboarding')
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="mb-6 text-2xl font-bold text-center">Create Account</Text>

      <TextInput
        className="p-4 mb-4 rounded-lg border"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className="p-4 mb-4 rounded-lg border"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity
        className="p-4 bg-green-600 rounded-lg"
        disabled={loading}
        onPress={handleSignUp}
      >
        <Text className="text-center text-white">{loading ? 'Loading...' : 'Register'}</Text>
      </TouchableOpacity>
    </View>
  )
}
