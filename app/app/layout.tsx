// app/layout.tsx or src/layout.tsx (depending on structure)
import '../global.css'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
