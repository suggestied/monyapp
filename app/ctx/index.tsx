import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from 'lib/supabase'
import { Session } from '@supabase/supabase-js'

type SessionContextType = {
  session: Session | null
  isLoading: boolean
  signIn: () => void
  signOut: () => void
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
})

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' })
    if (error) console.error('Sign in error:', error)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out error:', error)
  }

  return (
    <SessionContext.Provider value={{ session, isLoading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)