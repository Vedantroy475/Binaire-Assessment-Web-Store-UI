import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authService, type AuthUser } from '@/auth/AuthService'

/**
 * AuthContext - React bindings around the Firebase-backed {@link AuthService}.
 * Provides current user + sign up / in / out helpers and a loading flag so
 * protected UI can react to auth state.
 */

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  enabled: boolean
  signUp: (email: string, password: string, name?: string) => Promise<AuthUser>
  signIn: (email: string, password: string) => Promise<AuthUser>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(authService.enabled)

  useEffect(() => {
    if (!authService.enabled) {
      setLoading(false)
      return
    }
    const unsubscribe = authService.onAuthStateChanged((next) => {
      setUser(next)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signUp = useCallback<AuthContextValue['signUp']>(
    (email, password, name) => authService.signUp(email, password, name),
    [],
  )
  const signIn = useCallback<AuthContextValue['signIn']>(
    (email, password) => authService.signIn(email, password),
    [],
  )
  const signOut = useCallback(() => authService.signOut(), [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, enabled: authService.enabled, signUp, signIn, signOut }),
    [user, loading, signUp, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
