'use client'

import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from 'lib/supabase'
import { View, ActivityIndicator, Text, AppState } from 'react-native'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) console.log('[AuthLayout] Session error:', error)
      if (data.session) return router.replace('/home')
    })()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession) router.replace('/home')
    })

    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh()
      } else {
        supabase.auth.stopAutoRefresh()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
      appStateListener.remove()
    }
  }, [])

  return <>{children}</>
}