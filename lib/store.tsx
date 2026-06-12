'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Match, Participant, Prediction } from './data'

export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  isAdmin: boolean
}

interface AppState {
  user: User | null
  hydrated: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  updateProfile: (data: Partial<Pick<User, 'name' | 'avatar'>>) => Promise<void>
  matches: Match[]
  refreshMatches: () => Promise<void>
  predictions: Record<string, Prediction>
  savePrediction: (matchId: string, home: number, away: number) => Promise<void>
  participants: Participant[]
  refreshParticipants: () => Promise<void>
  adjustPoints: (participantId: string, delta: number) => Promise<void>
  setPoints: (participantId: string, points: number) => Promise<void>
  addMatch: (match: Match) => Promise<void>
  updateMatch: (matchId: string, data: Partial<Match>) => Promise<void>
  deleteMatch: (matchId: string) => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({})
  const [participants, setParticipants] = useState<Participant[]>([])

  const refreshMatches = useCallback(async () => {
    const res = await fetch('/api/matches')
    if (res.ok) setMatches(await res.json())
  }, [])

  const refreshParticipants = useCallback(async () => {
    const res = await fetch('/api/participants')
    if (res.ok) setParticipants(await res.json())
  }, [])

  const refreshPredictions = useCallback(async (userId: string) => {
    const res = await fetch(`/api/predictions?userId=${userId}`)
    if (res.ok) setPredictions(await res.json())
  }, [])

  // Restaura sessão
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('cp_user')
      if (raw) {
        const u = JSON.parse(raw) as User
        setUser(u)
        refreshPredictions(u.id)
      }
    } catch { /* noop */ }
    setHydrated(true)
    refreshMatches()
    refreshParticipants()
  }, [refreshMatches, refreshParticipants, refreshPredictions])

  const persistUser = useCallback((u: User | null) => {
    setUser(u)
    try {
      if (u) sessionStorage.setItem('cp_user', JSON.stringify(u))
      else sessionStorage.removeItem('cp_user')
    } catch { /* noop */ }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    })
    const data = await res.json()
    if (!data.ok) return { ok: false, error: data.error }
    persistUser(data.user)
    await refreshPredictions(data.user.id)
    return { ok: true }
  }, [persistUser, refreshPredictions])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', name, email, password }),
    })
    const data = await res.json()
    if (!data.ok) return { ok: false, error: data.error }
    persistUser(data.user)
    await refreshParticipants()
    return { ok: true }
  }, [persistUser, refreshParticipants])

  const logout = useCallback(() => {
    persistUser(null)
    setPredictions({})
  }, [persistUser])

  const updateProfile = useCallback(async (data: Partial<Pick<User, 'name' | 'avatar'>>) => {
    if (!user) return
    await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...data }),
    })
    const next = { ...user, ...data }
    persistUser(next)
    await refreshParticipants()
  }, [user, persistUser, refreshParticipants])

  const savePrediction = useCallback(async (matchId: string, home: number, away: number) => {
    if (!user) return
    await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, matchId, home, away }),
    })
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { matchId, home, away, savedAt: new Date().toISOString() },
    }))
  }, [user])

  const adjustPoints = useCallback(async (participantId: string, delta: number) => {
    await fetch(`/api/participants/${participantId}/points`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    })
    await refreshParticipants()
  }, [refreshParticipants])

  const setPoints = useCallback(async (participantId: string, points: number) => {
    await fetch(`/api/participants/${participantId}/points`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ set: points }),
    })
    await refreshParticipants()
  }, [refreshParticipants])

  const addMatch = useCallback(async (match: Match) => {
    await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match),
    })
    await refreshMatches()
  }, [refreshMatches])

  const updateMatch = useCallback(async (matchId: string, data: Partial<Match>) => {
    await fetch(`/api/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await refreshMatches()
  }, [refreshMatches])

  const deleteMatch = useCallback(async (matchId: string) => {
    await fetch(`/api/matches/${matchId}`, { method: 'DELETE' })
    await refreshMatches()
  }, [refreshMatches])

  const value: AppState = {
    user, hydrated, login, register, logout, updateProfile,
    matches, refreshMatches,
    predictions, savePrediction,
    participants, refreshParticipants,
    adjustPoints, setPoints,
    addMatch, updateMatch, deleteMatch,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider')
  return ctx
}
