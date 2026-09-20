import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, type Staff } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  staff: Staff | null
  loading: boolean
  signInWithDiscord: () => Promise<void>
  signOut: () => Promise<void>
  refreshStaff: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  session: null,
  staff: null,
  loading: true,
  signInWithDiscord: async () => {},
  signOut: async () => {},
  refreshStaff: async () => {},
})

function withTimeout<T>(promise: PromiseLike<T>, ms = 10000): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [staff, setStaff] = useState<Staff | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStaff = useCallback(async (userId: string) => {
    try {
      const { data } = await withTimeout(supabase.from('staff').select('*').eq('id', userId).single())
      setStaff(data)
    } catch {
      setStaff(null)
    }
  }, [])

  // Keeps the Discord username/avatar in sync on every login without touching duty status.
  const syncStaffFromDiscord = useCallback(async (currentSession: Session) => {
    const meta = currentSession.user.user_metadata
    try {
      await withTimeout(
        supabase.from('staff').upsert(
          {
            id: currentSession.user.id,
            discord_id: meta.provider_id ?? meta.sub ?? null,
            full_name: meta.full_name ?? meta.name ?? 'Agent',
            avatar_url: meta.avatar_url ?? null,
          },
          { onConflict: 'id' },
        ),
      )
    } catch {
      // best-effort sync; the row already exists from the on-signup trigger
    }
  }, [])

  const refreshStaff = useCallback(async () => {
    if (session?.user.id) await loadStaff(session.user.id)
  }, [session, loadStaff])

  useEffect(() => {
    withTimeout(supabase.auth.getSession())
      .then(async ({ data }) => {
        setSession(data.session)
        if (data.session) await loadStaff(data.session.user.id)
      })
      .catch(() => {
        setSession(null)
      })
      .finally(() => setLoading(false))

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)
      if (newSession) {
        if (event === 'SIGNED_IN') await syncStaffFromDiscord(newSession)
        await loadStaff(newSession.user.id)
      } else {
        setStaff(null)
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [loadStaff, syncStaffFromDiscord])

  const signInWithDiscord = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ session, staff, loading, signInWithDiscord, signOut, refreshStaff }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
