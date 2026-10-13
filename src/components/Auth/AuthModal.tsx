import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '@/auth/AuthService'
import { useAuth } from '@/auth/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * AuthModal - sign-up / sign-in dialog using Firebase Authentication only.
 * Displays a friendly notice when Firebase has not been configured yet.
 */

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { enabled, signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Close automatically once authenticated.
  useEffect(() => {
    if (user) onOpenChange(false)
  }, [user, onOpenChange])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (tab === 'signup') {
        await signUp(email, password, name || undefined)
      } else {
        await signIn(email, password)
      }
      setEmail('')
      setPassword('')
      setName('')
    } catch (err) {
      setError(AuthService.friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to WebStore</DialogTitle>
          <DialogDescription>
            {enabled
              ? 'Sign in to your account or create a new one to get started.'
              : 'Authentication is not configured yet. Add your Firebase keys to the .env file to enable sign-up / sign-in.'}
          </DialogDescription>
        </DialogHeader>

        {enabled ? (
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <form onSubmit={submit} className="mt-4 space-y-4">
              {tab === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="auth-name">Display name</Label>
                  <Input
                    id="auth-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={busy}>
                {busy ? 'Please wait…' : tab === 'signup' ? 'Create account' : 'Sign in'}
              </Button>
            </form>
          </Tabs>
        ) : (
          <div className="mt-2 space-y-3">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                onOpenChange(false)
                navigate('/setup')
              }}
            >
              View setup instructions
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
