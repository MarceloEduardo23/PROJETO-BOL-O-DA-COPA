'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle2 } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { MatchCard } from '@/components/match-card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/lib/store'

export default function HomePage() {
  const { matches } = useApp()
  const [tab, setTab] = useState('todos')

  const scheduled = matches.filter((m) => m.status === 'scheduled')
  const finished = matches.filter((m) => m.status === 'finished')

  const filtered = useMemo(() => {
    if (tab === 'em-breve') return scheduled
    if (tab === 'encerrados') return finished
    return [...scheduled, ...finished]
  }, [tab, scheduled, finished])

  return (
    <AppShell>
      {/* Hero */}
      <section className="mb-8 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 md:p-10">
        <div className="flex flex-col items-start gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="size-2 rounded-full bg-accent" /> Temporada Copa 2026
          </span>
          <h1 className="text-balance font-heading text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
            DÊ SEU PALPITE.
            <br />
            <span className="text-primary">DOMINE O BOLÃO.</span>
          </h1>
          <p className="max-w-xl text-pretty text-muted-foreground">
            Acerte os placares dos jogos da Copa do Mundo, acompanhe tudo ao vivo e suba na
            classificação contra seus amigos. Placar exato vale 3 pontos.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard icon={Clock} label="Em breve" value={scheduled.length} tone="soon" />
          <StatCard icon={CheckCircle2} label="Encerrados" value={finished.length} tone="done" />
        </div>
      </section>

      {/* Jogos */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">Jogos do dia</h2>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-5">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="em-breve">Em breve</TabsTrigger>
          <TabsTrigger value="encerrados">Encerrados</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">Nenhum jogo nesta categoria.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <MatchCard match={match} />
            </motion.div>
          ))}
        </div>
      )}
    </AppShell>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock
  label: string
  value: number
  tone: 'soon' | 'done'
}) {
  const toneClass = {
    soon: 'text-primary',
    done: 'text-accent',
  }[tone]
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-secondary/50 p-3">
      <Icon className={`size-4 ${toneClass}`} />
      <span className="font-heading text-2xl font-black tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
