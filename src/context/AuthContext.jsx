import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  // Prevent double-initialization from getSession + INITIAL_SESSION event
  const initialized = useRef(false)
  const profileFetchingRef = useRef(null)

  const fetchProfile = async (userId, retryCount = 0) => {
    // Deduplicate parallel fetches for the same user to prevent lock/race conditions
    if (profileFetchingRef.current === userId && retryCount === 0) return
    
    try {
      if (retryCount === 0) {
        profileFetchingRef.current = userId
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser && retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 500))
          return await fetchProfile(userId, retryCount + 1)
        }
        if (authUser) {
          setProfile({
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email.split('@')[0],
            role: authUser.user_metadata?.role || 'user',
            email: authUser.email,
          })
        } else {
          setUser(null)
          setProfile(null)
          await supabase.auth.signOut()
        }
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      if (retryCount === 0) {
        setUser(null)
        setProfile(null)
      }
    } finally {
      // Always unblock the UI after the top-level call finishes
      if (retryCount === 0) {
        setLoading(false)
        profileFetchingRef.current = null
      }
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      // Safety timeout: Never stay in loading state for more than 10 seconds
      const timeoutId = setTimeout(() => {
        if (mounted && loading) {
          console.warn('Auth initialization timed out, forcing unblock');
          setLoading(false);
          initialized.current = true;
        }
      }, 10000);

      try {
        // 1. Explicitly check for an existing session to unblock the UI immediately
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
        
        initialized.current = true
      } catch (err) {
        console.error('Auth initialization failed:', err)
        if (mounted) setLoading(false)
      } finally {
        clearTimeout(timeoutId);
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip handling the INITIAL_SESSION event if we've already manually initialized
        // or if it's the very first hit and initializeAuth is already running.
        if (event === 'INITIAL_SESSION' && initialized.current) return
        
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, name, role = 'user') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user, profile, loading,
        signUp, signIn, signOut,
        isAuthor: profile?.role === 'author' || profile?.role === 'admin',
        isAdmin: profile?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
} 