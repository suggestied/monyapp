// app/layout.tsx or src/layout.tsx (depending on structure)
import '../global.css'
import { ReactNode } from 'react'
import { Slot } from 'expo-router'

export default function Layout() {
  return (
    <Slot />
  )
}
