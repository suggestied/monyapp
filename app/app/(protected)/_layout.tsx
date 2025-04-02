'use client'

import { Slot, Redirect, usePathname } from 'expo-router'
import { useSession } from 'ctx'
import { Text } from 'react-native'

export default function ProtectedLayout() {
  const { session, isLoading } = useSession()
  const pathname = usePathname()

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  if (!session) {
    if (pathname !== '/login') {
      return <Redirect href="/login" />
    }
    return null // already on login page
  }

  return <Slot />
}