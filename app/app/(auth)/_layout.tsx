'use client'

import { Slot, Redirect, usePathname } from 'expo-router'
import { useSession } from 'ctx'
import { Text } from 'react-native'

export default function NonAuthLayout() {
  const { session, isLoading } = useSession()
  const pathname = usePathname()

  if (isLoading) return <Text>Loading...</Text>

  if (session) {
    const { name, age } = session.user.user_metadata || {}

    if (!name || !age) {
      if (pathname !== '/onboarding') {
        return <Redirect href="/onboarding" />
      }
      return null // already on onboarding
    }

    if (pathname !== '/home') {
      return <Redirect href="/home" />
    }

    return null // already on home
  }

  return <Slot />
}