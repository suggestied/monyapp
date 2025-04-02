import { useEffect, useState } from 'react'
import { Slot, useRouter } from 'expo-router'
import { supabase } from 'lib/supabase'
import { Session } from '@supabase/supabase-js'
import { View, ActivityIndicator, Text, AppState } from 'react-native'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) console.log('[AuthLayout] Session error:', error)
      setSession(data.session)
      setLoading(false)
      if (data.session) router.replace('/home')
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession)
      if (newSession) router.replace('/home')
    })

    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh()
        checkSession()
      } else {
        supabase.auth.stopAutoRefresh()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
      appStateListener.remove()
    }
  }, [])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-500">Checking session...</Text>
      </View>
    )
  }

  return <>
  <Slot />
  </>
}
