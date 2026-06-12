'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Save, Check, PlayCircle, MapPin, Lock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/lib/store'
import { formatKickoff } from '@/lib/scoring'
import { scorePrediction } from '@/lib/scoring'
import type { Match } from '@/lib/data'
import { cn } from '@/lib/utils'

function TeamBadge({ flag, name, code }: { flag: string; name: string; code: string }) {
  const isUrl = flag.startsWith('http') || flag.startsWith('/') || flag.startsWith('data:')
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
      {isUrl ? (
        <img
          src={flag}
          alt={name}
          className="h-9 w-13 rounded-sm object-cover"
          style={{ width: '3.25rem', height: '2.25rem' }}
        />
      ) : (
        <span className="text-3xl leading-none" role="img" aria-label={name}>
          {flag}
        </span>
      )}
      <span className="truncate text-sm font-semibold">{code}</span>
    </div>
  )
}

function Stepper({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number
  onChange: (v: number) => void
  disabled: boolean
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label={`Aumentar gols ${label}`}
        disabled={disabled}
        onClick={() => onChange(Math.min(20, value + 1))}
        className="flex size-8 items-center justify-center rounded-md border border-border bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
      <span className="font-heading text-3xl font-black tabular-nums">{value}</span>
      <button
        type="button"
        aria-label={`Diminuir gols ${label}`}
        disabled={disabled || value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex size-8 items-center justify-center rounded-md border border-border bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
    </div>
  )
}

function StatusTag({ match }: { match: Match }) {
  if (match.status === 'live') {
    return (
      <Badge className="gap-1.5 border-0 bg-destructive text-white">
        <span className="live-pulse inline-block size-2 rounded-full bg-white" />
        AO VIVO {match.minute}&apos;
      </Badge>
    )
  }
  if (match.status === 'finished') {
    return (
      <Badge variant="secondary" className="border-0">
        Encerrado
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-border">
      {formatKickoff(match.kickoff)}
    </Badge>
  )
}

export function MatchCard({ match }: { match: Match }) {
  const { user, predictions, savePrediction } = useApp()
  const existing = predictions[match.id]
  const [home, setHome] = useState(existing?.home ?? 0)
  const [away, setAway] = useState(existing?.away ?? 0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (existing) {
      setHome(existing.home)
      setAway(existing.away)
    }
  }, [existing])

  // Bloqueia palpites quando o jogo começa (hora do kickoff) ou não está mais agendado
  const locked = match.status !== 'scheduled' || new Date() >= new Date(match.kickoff)
  const points = scorePrediction(match, existing)

  function handleSave() {
    if (!user) {
      toast.error('Faça login para salvar seu palpite.')
      return
    }
    savePrediction(match.id, home, away)
    setSaved(true)
    toast.success('Palpite salvo!', {
      description: `${match.homeTeam.code} ${home} x ${away} ${match.awayTeam.code}`,
    })
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5">
        <span className="truncate text-xs font-medium text-muted-foreground">
          {match.stage} · {match.group}
        </span>
        <StatusTag match={match} />
      </div>

      <div className="px-4 py-4">
        {/* Placar / palpite */}
        <div className="flex items-center justify-between gap-2">
          <TeamBadge {...match.homeTeam} />

          {locked ? (
            <div className="flex items-center gap-3 px-2">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={`h-${match.homeScore}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-heading text-4xl font-black tabular-nums"
                >
                  {match.homeScore}
                </motion.span>
              </AnimatePresence>
              <span className="text-xl text-muted-foreground">x</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={`a-${match.awayScore}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-heading text-4xl font-black tabular-nums"
                >
                  {match.awayScore}
                </motion.span>
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2">
              <Stepper value={home} onChange={setHome} disabled={locked} label={match.homeTeam.code} />
              <span className="text-xl text-muted-foreground">x</span>
              <Stepper value={away} onChange={setAway} disabled={locked} label={match.awayTeam.code} />
            </div>
          )}

          <TeamBadge {...match.awayTeam} />
        </div>

        {/* Local */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>

        {/* Palpite registrado / pontuação */}
        {existing && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
              Seu palpite: {existing.home} x {existing.away}
            </span>
            {points !== null && (
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 font-bold',
                  points === 3 && 'bg-accent text-accent-foreground',
                  points === 1 && 'bg-gold text-gold-foreground',
                  points === 0 && 'bg-secondary text-muted-foreground',
                )}
              >
                {points > 0 ? `+${points} ${points === 1 ? 'ponto' : 'pontos'}` : 'Sem pontos'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 border-t border-border/60 px-4 py-3">

        <div className="flex-1" />
        {locked ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Lock className="size-3.5" /> Palpites encerrados
          </span>
        ) : (
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {saved ? 'Salvo' : 'Salvar palpite'}
          </Button>
        )}
      </div>
    </Card>
  )
}
