import { firebaseConfig, hasFirebaseConfig } from '@/config/env'

/**
 * AuthService - wraps Firebase Authentication.
 *
 * The brief requires sign-up + authentication using Firebase ONLY. This class
 * lazily initialises the Firebase app/auth on first use so the module can be
 * imported even before credentials exist. When config is missing it stays
 * "disabled" and the UI shows a friendly message instead of crashing.
 *
 * Email/password auth is implemented: sign up, sign in, sign out, and an
 * auth-state subscription used by the app's AuthContext.
 */

// Firebase is imported dynamically to avoid bundling cost at startup and to
// allow graceful behaviour when the project has no keys yet.
type FirebaseAuth = import('firebase/auth').Auth
type FirebaseUser = import('firebase/auth').User

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
}

export class AuthService {
  private auth: FirebaseAuth | null = null
  private initPromise: Promise<FirebaseAuth | null> | null = null

  get enabled(): boolean {
    return hasFirebaseConfig()
  }

  private async init(): Promise<FirebaseAuth | null> {
    if (!this.enabled) return null
    if (this.auth) return this.auth
    if (this.initPromise) return this.initPromise

    this.initPromise = (async () => {
      const [{ initializeApp, getApps, getApp }, { getAuth, browserLocalPersistence, setPersistence }] =
        await Promise.all([
          import('firebase/app'),
          import('firebase/auth'),
        ])
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
      const auth = getAuth(app)
      await setPersistence(auth, browserLocalPersistence)
      this.auth = auth
      return auth
    })()

    return this.initPromise
  }

  private toAuthUser(user: FirebaseUser | null): AuthUser | null {
    if (!user) return null
    return { uid: user.uid, email: user.email, displayName: user.displayName }
  }

  /** Create a new account with email + password. */
  async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
    const auth = await this.init()
    if (!auth) throw new Error('Firebase is not configured. Add your VITE_FIREBASE_* keys to .env')
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await updateProfile(cred.user, { displayName })
    }
    return this.toAuthUser(cred.user)!
  }

  /** Sign in an existing user. */
  async signIn(email: string, password: string): Promise<AuthUser> {
    const auth = await this.init()
    if (!auth) throw new Error('Firebase is not configured. Add your VITE_FIREBASE_* keys to .env')
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return this.toAuthUser(cred.user)!
  }

  /** Sign out the current user. */
  async signOut(): Promise<void> {
    const auth = await this.init()
    if (!auth) return
    const { signOut } = await import('firebase/auth')
    await signOut(auth)
  }

  /** Subscribe to auth-state changes. Returns an unsubscribe function. */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    let unsubscribe: (() => void) | null = null
    let active = true

    this.init().then((auth) => {
      if (!auth || !active) return
      // dynamic import for the API
      import('firebase/auth').then(({ onAuthStateChanged: onState }) => {
        if (!active) return
        unsubscribe = onState(auth, (user) => callback(this.toAuthUser(user)))
      })
    })

    return () => {
      active = false
      unsubscribe?.()
    }
  }

  /** Translate a Firebase error code into a friendly message. */
  static friendlyError(error: unknown): string {
    const code = (error as { code?: string })?.code ?? ''
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'That email is already registered. Try signing in.',
      'auth/invalid-email': 'That email address looks invalid.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-not-found': 'No account found for that email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your connection.',
    }
    return map[code] ?? (error as Error)?.message ?? 'Something went wrong. Please try again.'
  }
}

/** Singleton auth service. */
export const authService = new AuthService()
