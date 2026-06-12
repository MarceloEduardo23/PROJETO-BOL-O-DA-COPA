'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Medal, Target, TrendingUp } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/lib/store'
import { POOL_GROUPS } from '@/lib/data'
import { cn } from '@/lib/utils'

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function ClassificacaoPage() {
  const { participants, user } = useApp()
  const [group, setGroup] = useState('Geral')

  const ranked = useMemo(() => {
    const list =
      group === 'Geral' ? participants : participants.filter((p) => p.group === group)
    return [...list].sort((a, b) => b.points - a.points || b.exactHits - a.exactHits)
  }, [participants, group])

  const top3 = ranked.slice(0, 3)

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight md:text-4xl">
            Classificação
          </h1>
          <p className="mt-1 text-muted-foreground">
            Placar exato vale 3 pontos · acertar o vencedor vale 1 ponto.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <Select value={group} onValueChange={(v) => setGroup(v ?? 'Geral')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar grupo" />
            </SelectTrigger>
            <SelectContent>
              {POOL_GROUPS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g === 'Geral' ? 'Classificação geral' : g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pódio */}
      {top3.length === 3 && (
        <div className="mb-8 grid grid-cols-3 items-end gap-2 sm:gap-4">
          <Podium participant={top3[1]} place={2} />
          <Podium participant={top3[0]} place={1} />
          <Podium participant={top3[2]} place={3} />
        </div>
      )}

      {/* Lista completa */}
      <Card className="overflow-hidden p-0">
        <div className="hidden items-center gap-4 border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:flex">
          <span className="w-8 text-center">#</span>
          <span className="flex-1">Participante</span>
          <span className="flex w-16 items-center justify-center gap-1">
            <Target className="size-3.5" /> Exatos
          </span>
          <span className="flex w-16 items-center justify-center gap-1">
            <TrendingUp className="size-3.5" /> Result.
          </span>
          <span className="w-16 text-right">Pontos</span>
        </div>

        <ul>
          {ranked.map((p, i) => {
            const isMe = p.id === user?.id || (!user && p.id === 'u1')
            return (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'flex items-center gap-3 border-b border-border/40 px-4 py-3 last:border-0 sm:gap-4',
                  isMe && 'bg-primary/10',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full font-heading text-sm font-black tabular-nums',
                    i === 0 && 'bg-gold text-gold-foreground',
                    i === 1 && 'bg-muted-foreground/30 text-foreground',
                    i === 2 && 'bg-destructive/20 text-foreground',
                    i > 2 && 'text-muted-foreground',
                  )}
                >
                  {i + 1}
                </span>

                <Avatar className="size-9 shrink-0 border border-border">
                  {p.avatar && <AvatarImage src={p.avatar} alt={p.name} />}
                  <AvatarFallback className="bg-secondary text-xs font-bold">
                    {initials(p.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">
                    {p.name}
                    {isMe && (
                      <span className="ml-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        VOCÊ
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground sm:hidden">
                    {p.exactHits} exatos · {p.resultHits} resultados
                  </span>
                </div>

                <span className="hidden w-16 text-center text-sm tabular-nums text-muted-foreground sm:block">
                  {p.exactHits}
                </span>
                <span className="hidden w-16 text-center text-sm tabular-nums text-muted-foreground sm:block">
                  {p.resultHits}
                </span>
                <span className="w-16 text-right font-heading text-xl font-black tabular-nums">
                  {p.points}
                </span>
              </motion.li>
            )
          })}
        </ul>
      </Card>
    </AppShell>
  )
}

function Podium({
  participant,
  place,
}: {
  participant: { name: string; points: number; avatar: string | null }
  place: 1 | 2 | 3
}) {
  const config = {
    1: { h: 'h-28', ring: 'ring-gold', badge: 'bg-gold text-gold-foreground', icon: Crown },
    2: { h: 'h-20', ring: 'ring-muted-foreground/50', badge: 'bg-muted-foreground/30 text-foreground', icon: Medal },
    3: { h: 'h-16', ring: 'ring-destructive/50', badge: 'bg-destructive/30 text-foreground', icon: Medal },
  }[place]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: place * 0.08 }}
      className="flex flex-col items-center gap-2"
    >
      <Avatar className={cn('size-14 border-2 border-border ring-2 ring-offset-2 ring-offset-background', config.ring)}>
        {participant.avatar && <AvatarImage src={participant.avatar} alt={participant.name} />}
        <AvatarFallback className="bg-secondary text-sm font-bold">
          {initials(participant.name)}
        </AvatarFallback>
      </Avatar>
      <span className="max-w-full truncate text-center text-xs font-semibold">
        {participant.name}
      </span>
      <span className="font-heading text-lg font-black tabular-nums">{participant.points}</span>
      <div
        className={cn(
          'flex w-full flex-col items-center justify-start rounded-t-lg bg-secondary pt-2',
          config.h,
        )}
      >
        <span className={cn('flex size-7 items-center justify-center rounded-full', config.badge)}>
          <Icon className="size-4" />
        </span>
        <span className="mt-1 font-heading text-2xl font-black text-muted-foreground/60">
          {place}
        </span>
      </div>
    </motion.div>
  )
}
