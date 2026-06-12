'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, Save, Target, TrendingUp, Trophy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/lib/store'
import { scorePrediction } from '@/lib/scoring'

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, hydrated, updateProfile, predictions, matches, participants } = useApp()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!hydrated) return
    if (user === null) {
      router.replace('/login')
    } else {
      setName(user.name)
    }
  }, [user, hydrated, router])

  if (!user) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AppShell>
    )
  }

  const myStats = participants.find((p) => p.id === user.id) ??
    participants.find((p) => p.id === 'u1') ?? { points: 0, exactHits: 0, resultHits: 0 }

  const myPredictions = Object.values(predictions)
    .map((pred) => ({ pred, match: matches.find((m) => m.id === pred.matchId) }))
    .filter((x) => x.match)
    .sort((a, b) => new Date(b.pred.savedAt).getTime() - new Date(a.pred.savedAt).getTime())

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateProfile({ avatar: reader.result as string })
      toast.success('Foto atualizada!')
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (name.trim().length < 2) {
      toast.error('Informe um nome válido.')
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    updateProfile({ name: name.trim() })
    setSaving(false)
    toast.success('Perfil atualizado!')
  }

  return (
    <AppShell>
      <h1 className="mb-6 font-heading text-3xl font-black tracking-tight md:text-4xl">
        Meu perfil
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna esquerda: dados e foto */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card className="flex flex-col items-center gap-4 p-6">
            <div className="relative">
              <Avatar className="size-24 border-2 border-border">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground transition-transform hover:scale-105"
                aria-label="Trocar foto de perfil"
              >
                <Camera className="size-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
            </div>
            <div className="text-center">
              <p className="font-heading text-lg font-bold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            {user.isAdmin && <Badge className="border-0 bg-gold text-gold-foreground">Administrador</Badge>}
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <h2 className="font-heading text-lg font-bold">Editar dados</h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email-ro">E-mail</Label>
              <Input id="email-ro" value={user.email} disabled />
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Salvar alterações
            </Button>
          </Card>
        </div>

        {/* Coluna direita: estatísticas e palpites */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            <StatBox icon={Trophy} label="Pontos" value={myStats.points} tone="text-gold" />
            <StatBox icon={Target} label="Placares exatos" value={myStats.exactHits} tone="text-accent" />
            <StatBox icon={TrendingUp} label="Resultados" value={myStats.resultHits} tone="text-primary" />
          </div>

          <Card className="p-6">
            <h2 className="mb-4 font-heading text-lg font-bold">Palpites recentes</h2>
            {myPredictions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Você ainda não fez palpites. Vá para a página de jogos e comece!
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {myPredictions.map(({ pred, match }, i) => {
                  if (!match) return null
                  const pts = scorePrediction(match, pred)
                  return (
                    <motion.li
                      key={pred.matchId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-secondary/40 px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2 text-sm">
                        <span role="img" aria-label={match.homeTeam.name}>
                          {match.homeTeam.flag}
                        </span>
                        <span className="font-medium">{match.homeTeam.code}</span>
                        <span className="font-heading font-bold tabular-nums">
                          {pred.home} x {pred.away}
                        </span>
                        <span className="font-medium">{match.awayTeam.code}</span>
                        <span role="img" aria-label={match.awayTeam.name}>
                          {match.awayTeam.flag}
                        </span>
                      </div>
                      {pts !== null ? (
                        <Badge
                          className="border-0"
                          variant={pts > 0 ? 'default' : 'secondary'}
                        >
                          {pts > 0 ? `+${pts}` : '0'} pts
                        </Badge>
                      ) : (
                        <Badge variant="outline">Aguardando</Badge>
                      )}
                    </motion.li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

function StatBox({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Trophy
  label: string
  value: number
  tone: string
}) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <Icon className={`size-5 ${tone}`} />
      <span className="font-heading text-3xl font-black tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Card>
  )
}
