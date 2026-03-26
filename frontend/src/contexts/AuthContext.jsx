import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import api from '../lib/api'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const lastSessionId = useRef(null)

  useEffect(() => {
    let mounted = true
    let sessionCheckComplete = false

    // Set a timeout to ensure loading is completed for session check
    const loadingTimeout = setTimeout(() => {
      if (mounted && !sessionCheckComplete) {
        console.warn('Session check timeout - setting loading to false')
        setLoading(false)
        sessionCheckComplete = true
      }
    }, 5000) // 5 second timeout

    // Global safety timeout to ensure loading is ALWAYS cleared
    const globalSafetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Global safety timeout reached - ensuring loading is false')
        setLoading(false)
      }
    }, 10000) // 10 second absolute limit

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      sessionCheckComplete = true
      clearTimeout(loadingTimeout)
      
      setUser(session?.user ?? null)
      if (session?.user) {
        if (lastSessionId.current !== session.user.id) {
          lastSessionId.current = session.user.id
          fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } else {
        lastSessionId.current = null
        setLoading(false)
      }
    }).catch(err => {
      console.error("Failed to get session", err)
      if (mounted) {
        sessionCheckComplete = true
        clearTimeout(loadingTimeout)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      if (!sessionCheckComplete) {
        sessionCheckComplete = true
        clearTimeout(loadingTimeout)
      }
      
      console.log('Auth state changed:', event)
      setUser(session?.user ?? null)
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (lastSessionId.current !== session.user.id) {
            lastSessionId.current = session.user.id
            await fetchProfile(session.user.id)
            await checkAdminStatus()
          }
        }
      } else {
        lastSessionId.current = null
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(loadingTimeout)
      clearTimeout(globalSafetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId) => {
    try {
      // Add timeout to prevent indefinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const res = await api.get('/users/me', { signal: controller.signal })
      clearTimeout(timeoutId)
      setProfile(res.data.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Don't fail on profile fetch - user is still authenticated
      // Just log the error and set profile to null
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const checkAdminStatus = async () => {
    try {
      const res = await api.get('/users/is-admin')
      if (res.data.data) {
        setProfile(prev => ({ ...prev, role: 'admin' }))
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setLoading(false)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const value = {
    user,
    profile,
    loading,
    logout,
    refreshProfile: () => user && fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
