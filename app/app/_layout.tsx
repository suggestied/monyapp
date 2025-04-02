import '../global.css'
import { ReactNode } from 'react'
import { Slot } from 'expo-router'
import { SessionProvider } from 'ctx'

export default function Layout() {
  return (
    <SessionProvider>
    <Slot />
    </SessionProvider>
  )
}
