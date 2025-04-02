import { Text, View, TouchableOpacity } from 'react-native'
import { supabase } from 'lib/supabase'
import { useRouter } from 'expo-router'

export default function HomePage() {
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error.message)
    } else {
      router.replace('/') // go back to login
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home Page</Text>
      <TouchableOpacity
        onPress={handleSignOut}
        style={{ marginTop: 20, padding: 12, backgroundColor: '#ef4444', borderRadius: 8 }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}
