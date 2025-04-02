import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from 'lib/supabase'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) return Alert.alert('Login failed', error.message)
    router.replace('/home')
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="mb-6 text-2xl font-bold text-center">Welcome</Text>

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
        className="p-4 bg-blue-500 rounded-lg"
        disabled={loading}
        onPress={handleSignIn}
      >
        <Text className="text-center text-white">{loading ? 'Loading...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-4" onPress={() => router.push('/register')}>
        <Text className="text-center text-blue-600">Don’t have an account? Register</Text>
      </TouchableOpacity>
    </View>
  )
}
