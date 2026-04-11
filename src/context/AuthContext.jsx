import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const profileFetchingRef = useRef(null)

  const fetchProfile = async (userId, authUserOrSessionUser = null) => {
    if (profileFetchingRef.current === userId) return
    
    try {
      profileFetchingRef.current = userId
      setProfileLoading(true)

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
      } else {
        // Fallback: If no database profile, generate one from metadata
        const authUser = authUserOrSessionUser || (await supabase.auth.getUser()).data?.user
        if (authUser) {
          setProfile({
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            role: authUser.user_metadata?.role || 'user',
            email: authUser.email,
          })
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
      setProfileLoading(false)
      profileFetchingRef.current = null
    }
  }

  useEffect(() => {
    let mounted = true
    
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        
        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        // Non-blocking: We set loading(false) immediately if we checked session
        // This prevents the "blank page" hang.
        setLoading(false)

        if (currentUser) {
          fetchProfile(currentUser.id, currentUser)
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) setLoading(false)
      }
    }

    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (event === 'SIGNED_IN') {
          setLoading(false)
          fetchProfile(currentUser.id, currentUser)
        } else if (event === 'SIGNED_OUT') {
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

  const deriveRole = (u, p) => {
    // Priority: Database Profile > User Metadata > Default 'user'
    if (p?.role) return p.role
    if (u?.user_metadata?.role) return u.user_metadata.role
    return 'user'
  }

  const role = deriveRole(user, profile)

  return (
    <AuthContext.Provider
      value={{
        user, profile, loading, profileLoading,
        signUp, signIn, signOut,
        role,
        isAuthor: role === 'author' || role === 'admin',
        isAdmin: role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}