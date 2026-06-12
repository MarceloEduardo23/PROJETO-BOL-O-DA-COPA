'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Minus, Plus, Pencil, Check, Loader2, Users,
  Swords, Trash2, X, ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApp } from '@/lib/store'
import { formatKickoff } from '@/lib/scoring'
import type { Participant, Match, MatchStatus, Stage } from '@/lib/data'
import { TEAMS, INITIAL_MATCHES } from '@/lib/data'
import { cn } from '@/lib/utils'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

// Renderiza bandeira: se for URL de imagem usa <img>, senão usa emoji
function FlagDisplay({ flag, name, size = 'md' }: { flag: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const isUrl = flag.startsWith('http') || flag.startsWith('/') || flag.startsWith('data:')
  const sizeClass = size === 'sm' ? 'h-5 w-7' : size === 'lg' ? 'h-10 w-14' : 'h-7 w-10'
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-4xl' : 'text-2xl'

  if (isUrl) {
    return (
      <img
        src={flag}
        alt={name}
        className={cn('rounded-sm object-cover', sizeClass)}
      />
    )
  }
  return <span className={textSize} role="img" aria-label={name}>{flag}</span>
}

const STAGES: Stage[] = [
  'Fase de Grupos', 'Oitavas de Final', 'Quartas de Final', 'Semifinal', 'Final'
]
const STATUS_OPTIONS: { value: MatchStatus; label: string }[] = [
  { value: 'scheduled', label: 'Em breve' },
  { value: 'live', label: 'Ao vivo' },
  { value: 'finished', label: 'Encerrado' },
]

const TEAM_LIST = Object.values(TEAMS)

const EMPTY_MATCH: Omit<Match, 'id'> = {
  homeTeam: TEAMS.bra,
  awayTeam: TEAMS.arg,
  kickoff: new Date(Date.now() + 3600_000).toISOString(),
  group: 'Grupo A',
  stage: 'Fase de Grupos',
  round: 1,
  status: 'scheduled',
  homeScore: null,
  awayScore: null,
  minute: null,
  venue: '',
  youtubeId: null,
}

interface MatchFormState {
  homeTeamId: string
  homeTeamFlagOverride: string
  awayTeamId: string
  awayTeamFlagOverride: string
  kickoff: string
  group: string
  stage: Stage
  round: number
  status: MatchStatus
  homeScore: string
  awayScore: string
  minute: string
  venue: string
  youtubeId: string
}

function matchToForm(m: Match): MatchFormState {
  return {
    homeTeamId: m.homeTeam.id,
    homeTeamFlagOverride: m.homeTeam.flag.startsWith('http') || m.homeTeam.flag.startsWith('/') ? m.homeTeam.flag : '',
    awayTeamId: m.awayTeam.id,
    awayTeamFlagOverride: m.awayTeam.flag.startsWith('http') || m.awayTeam.flag.startsWith('/') ? m.awayTeam.flag : '',
    kickoff: m.kickoff.slice(0, 16),
    group: m.group,
    stage: m.stage,
    round: m.round,
    status: m.status,
    homeScore: m.homeScore !== null ? String(m.homeScore) : '',
    awayScore: m.awayScore !== null ? String(m.awayScore) : '',
    minute: m.minute !== null ? String(m.minute) : '',
    venue: m.venue,
    youtubeId: m.youtubeId ?? '',
  }
}

function defaultForm(): MatchFormState {
  return {
    homeTeamId: 'bra',
    homeTeamFlagOverride: '',
    awayTeamId: 'arg',
    awayTeamFlagOverride: '',
    kickoff: new Date(Date.now() + 3600_000).toISOString().slice(0, 16),
    group: 'Grupo A',
    stage: 'Fase de Grupos',
    round: 1,
    status: 'scheduled',
    homeScore: '',
    awayScore: '',
    minute: '',
    venue: '',
    youtubeId: '',
  }
}

export default function AdminPage() {
  const router = useRouter()
  const { user, hydrated, matches, participants, adjustPoints, setPoints, addMatch, updateMatch, deleteMatch } = useApp()

  // --- pontuações ---
  const [editing, setEditing] = useState<Participant | null>(null)
  const [editValue, setEditValue] = useState('')

  // --- jogos ---
  const [matchDialogOpen, setMatchDialogOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [matchForm, setMatchForm] = useState<MatchFormState>(defaultForm())
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [matchFilter, setMatchFilter] = useState<MatchStatus | 'all'>('all')

  useEffect(() => {
    if (!hydrated) return
    if (user === null) router.replace('/login')
    else if (user && !user.isAdmin) router.replace('/')
  }, [user, hydrated, router])

  if (!user || !user.isAdmin) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AppShell>
    )
  }

  const ranked = [...participants].sort((a, b) => b.points - a.points)

  function openEdit(p: Participant) {
    setEditing(p)
    setEditValue(String(p.points))
  }

  function confirmEdit() {
    if (!editing) return
    const val = Number.parseInt(editValue, 10)
    if (Number.isNaN(val) || val < 0) {
      toast.error('Informe um número válido.')
      return
    }
    setPoints(editing.id, val)
    toast.success(`Pontuação de ${editing.name} definida para ${val}.`)
    setEditing(null)
  }

  function quickAdjust(p: Participant, delta: number) {
    adjustPoints(p.id, delta)
    toast.success(`${delta > 0 ? '+' : ''}${delta} ponto para ${p.name}.`)
  }

  // --- jogos handlers ---
  function openNewMatch() {
    setEditingMatch(null)
    setMatchForm(defaultForm())
    setMatchDialogOpen(true)
  }

  function openEditMatch(m: Match) {
    setEditingMatch(m)
    setMatchForm(matchToForm(m))
    setMatchDialogOpen(true)
  }

  function setField<K extends keyof MatchFormState>(key: K, value: MatchFormState[K]) {
    setMatchForm((prev) => ({ ...prev, [key]: value }))
  }

  function buildMatchFromForm(id: string): Match {
    const homeBase = TEAMS[matchForm.homeTeamId] ?? TEAM_LIST[0]
    const awayBase = TEAMS[matchForm.awayTeamId] ?? TEAM_LIST[0]
    const homeFlag = matchForm.homeTeamFlagOverride.trim() || homeBase.flag
    const awayFlag = matchForm.awayTeamFlagOverride.trim() || awayBase.flag

    const live = matchForm.status === 'live' || matchForm.status === 'finished'
    return {
      id,
      homeTeam: { ...homeBase, flag: homeFlag },
      awayTeam: { ...awayBase, flag: awayFlag },
      kickoff: new Date(matchForm.kickoff).toISOString(),
      group: matchForm.group,
      stage: matchForm.stage,
      round: matchForm.round,
      status: matchForm.status,
      homeScore: live && matchForm.homeScore !== '' ? Number(matchForm.homeScore) : null,
      awayScore: live && matchForm.awayScore !== '' ? Number(matchForm.awayScore) : null,
      minute: matchForm.status === 'live' && matchForm.minute !== '' ? Number(matchForm.minute) : (matchForm.status === 'finished' ? 90 : null),
      venue: matchForm.venue,
      youtubeId: matchForm.youtubeId.trim() || null,
    }
  }

  function saveMatch() {
    if (!matchForm.venue.trim()) {
      toast.error('Informe o estádio/local do jogo.')
      return
    }
    if (editingMatch) {
      const updated = buildMatchFromForm(editingMatch.id)
      updateMatch(editingMatch.id, updated)
      toast.success('Jogo atualizado!')
    } else {
      const newMatch = buildMatchFromForm(`m${Date.now()}`)
      addMatch(newMatch)
      toast.success('Jogo adicionado!')
    }
    setMatchDialogOpen(false)
  }

  function confirmDelete(id: string) {
    deleteMatch(id)
    setDeleteConfirm(null)
    toast.success('Jogo removido.')
  }

  const filteredMatches = matchFilter === 'all'
    ? [...matches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    : matches.filter((m) => m.status === matchFilter).sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())

  const statusLabel: Record<MatchStatus, string> = {
    scheduled: 'Em breve',
    live: 'Ao vivo',
    finished: 'Encerrado',
  }
  const statusColor: Record<MatchStatus, string> = {
    scheduled: 'bg-secondary text-foreground',
    live: 'bg-destructive text-white',
    finished: 'bg-muted text-muted-foreground',
  }

  const homeTeamPreview = TEAMS[matchForm.homeTeamId]
  const awayTeamPreview = TEAMS[matchForm.awayTeamId]
  const homeFlagPreview = matchForm.homeTeamFlagOverride.trim() || homeTeamPreview?.flag || '?'
  const awayFlagPreview = matchForm.awayTeamFlagOverride.trim() || awayTeamPreview?.flag || '?'

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-gold text-gold-foreground">
          <ShieldCheck className="size-6" />
        </span>
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight">Painel do administrador</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie jogos e pontuações do bolão.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="flex flex-col gap-1 p-4">
          <Users className="size-5 text-primary" />
          <span className="font-heading text-2xl font-black">{participants.length}</span>
          <span className="text-xs text-muted-foreground">Participantes</span>
        </Card>
        <Card className="flex flex-col gap-1 p-4">
          <Swords className="size-5 text-accent" />
          <span className="font-heading text-2xl font-black">{matches.length}</span>
          <span className="text-xs text-muted-foreground">Jogos</span>
        </Card>
        <Card className="flex flex-col gap-1 p-4">
          <ShieldCheck className="size-5 text-gold" />
          <span className="truncate font-heading text-lg font-black">{ranked[0]?.name}</span>
          <span className="text-xs text-muted-foreground">Líder</span>
        </Card>
      </div>

      <Tabs defaultValue="matches">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="matches" className="flex-1 gap-2">
            <Swords className="size-4" /> Jogos
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex-1 gap-2">
            <Users className="size-4" /> Pontuações
          </TabsTrigger>
        </TabsList>

        {/* ─── ABA JOGOS ─── */}
        <TabsContent value="matches">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {(['all', 'scheduled', 'live', 'finished'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setMatchFilter(f)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                    matchFilter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80',
                  )}
                >
                  {f === 'all' ? 'Todos' : f === 'scheduled' ? 'Em breve' : f === 'live' ? 'Ao vivo' : 'Encerrados'}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={openNewMatch} className="gap-1.5 shrink-0">
              <Plus className="size-4" /> Novo jogo
            </Button>
          </div>

          <Card className="overflow-hidden p-0">
            {filteredMatches.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nenhum jogo encontrado.
              </div>
            ) : (
              <ul>
                {filteredMatches.map((m) => (
                  <motion.li
                    key={m.id}
                    layout
                    className="flex flex-wrap items-center gap-3 border-b border-border/40 px-4 py-3 last:border-0"
                  >
                    {/* Times e placar */}
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <FlagDisplay flag={m.homeTeam.flag} name={m.homeTeam.name} size="sm" />
                      <span className="text-sm font-bold">{m.homeTeam.code}</span>
                      {m.status !== 'scheduled' ? (
                        <span className="font-heading text-sm font-black tabular-nums text-muted-foreground">
                          {m.homeScore ?? '–'} x {m.awayScore ?? '–'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{formatKickoff(m.kickoff)}</span>
                      )}
                      <span className="text-sm font-bold">{m.awayTeam.code}</span>
                      <FlagDisplay flag={m.awayTeam.flag} name={m.awayTeam.name} size="sm" />
                    </div>

                    {/* Status badge */}
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', statusColor[m.status])}>
                      {m.status === 'live' ? `● ${m.minute}'` : statusLabel[m.status]}
                    </span>

                    {/* Ações */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8"
                        onClick={() => openEditMatch(m)}
                        aria-label="Editar jogo"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => setDeleteConfirm(m.id)}
                        aria-label="Remover jogo"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        {/* ─── ABA PONTUAÇÕES ─── */}
        <TabsContent value="scores">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border/60 px-4 py-3">
              <h2 className="font-heading text-lg font-bold">Gerenciar pontuações</h2>
            </div>
            <ul>
              {ranked.map((p, i) => (
                <motion.li
                  key={p.id}
                  layout
                  className="flex flex-wrap items-center gap-3 border-b border-border/40 px-4 py-3 last:border-0"
                >
                  <span className="w-6 text-center font-heading text-sm font-black tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <Avatar className="size-9 border border-border">
                    {p.avatar && <AvatarImage src={p.avatar} alt={p.name} />}
                    <AvatarFallback className="bg-secondary text-xs font-bold">
                      {initials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.group}</span>
                  </div>
                  <Badge variant="secondary" className="font-heading text-base font-black tabular-nums">
                    {p.points}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="size-8" onClick={() => quickAdjust(p, -1)}>
                      <Minus className="size-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="size-8" onClick={() => quickAdjust(p, 1)}>
                      <Plus className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(p)}>
                      <Pencil className="size-4" />
                    </Button>
                  </div>
                </motion.li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── DIALOG EDITAR/CRIAR JOGO ─── */}
      <Dialog open={matchDialogOpen} onOpenChange={(o) => !o && setMatchDialogOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMatch ? 'Editar jogo' : 'Novo jogo'}</DialogTitle>
            <DialogDescription>
              Preencha as informações do jogo. A bandeira pode ser um emoji ou URL de imagem.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Preview times */}
            <div className="flex items-center justify-center gap-4 rounded-xl bg-secondary/60 py-4">
              <div className="flex flex-col items-center gap-1">
                <FlagDisplay flag={homeFlagPreview} name={homeTeamPreview?.name ?? ''} size="lg" />
                <span className="text-xs font-bold">{homeTeamPreview?.code}</span>
              </div>
              <span className="font-heading text-xl font-black text-muted-foreground">VS</span>
              <div className="flex flex-col items-center gap-1">
                <FlagDisplay flag={awayFlagPreview} name={awayTeamPreview?.name ?? ''} size="lg" />
                <span className="text-xs font-bold">{awayTeamPreview?.code}</span>
              </div>
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Time da casa</Label>
                <Select value={matchForm.homeTeamId} onValueChange={(v) => setField('homeTeamId', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEAM_LIST.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.flag} {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Time visitante</Label>
                <Select value={matchForm.awayTeamId} onValueChange={(v) => setField('awayTeamId', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEAM_LIST.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.flag} {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bandeiras customizadas (URL de imagem) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Bandeira casa (URL de imagem, opcional)</Label>
                <Input
                  placeholder="https://... ou deixe vazio p/ emoji"
                  value={matchForm.homeTeamFlagOverride}
                  onChange={(e) => setField('homeTeamFlagOverride', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Bandeira visitante (URL de imagem, opcional)</Label>
                <Input
                  placeholder="https://... ou deixe vazio p/ emoji"
                  value={matchForm.awayTeamFlagOverride}
                  onChange={(e) => setField('awayTeamFlagOverride', e.target.value)}
                />
              </div>
            </div>

            {/* Data/hora + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Data e hora</Label>
                <Input
                  type="datetime-local"
                  value={matchForm.kickoff}
                  onChange={(e) => setField('kickoff', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select value={matchForm.status} onValueChange={(v) => setField('status', v as MatchStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Placar (só se ao vivo ou encerrado) */}
            {(matchForm.status === 'live' || matchForm.status === 'finished') && (
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Gols casa</Label>
                  <Input
                    type="number"
                    min={0}
                    value={matchForm.homeScore}
                    onChange={(e) => setField('homeScore', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Gols visitante</Label>
                  <Input
                    type="number"
                    min={0}
                    value={matchForm.awayScore}
                    onChange={(e) => setField('awayScore', e.target.value)}
                    placeholder="0"
                  />
                </div>
                {matchForm.status === 'live' && (
                  <div className="flex flex-col gap-1.5">
                    <Label>Minuto</Label>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={matchForm.minute}
                      onChange={(e) => setField('minute', e.target.value)}
                      placeholder="45"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Fase + Grupo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Fase</Label>
                <Select value={matchForm.stage} onValueChange={(v) => setField('stage', v as Stage)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Grupo</Label>
                <Input
                  value={matchForm.group}
                  onChange={(e) => setField('group', e.target.value)}
                  placeholder="Grupo A"
                />
              </div>
            </div>

            {/* Local */}
            <div className="flex flex-col gap-1.5">
              <Label>Estádio / Local *</Label>
              <Input
                value={matchForm.venue}
                onChange={(e) => setField('venue', e.target.value)}
                placeholder="MetLife Stadium, Nova York"
              />
            </div>

            {/* YouTube */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">YouTube ID (opcional)</Label>
              <Input
                value={matchForm.youtubeId}
                onChange={(e) => setField('youtubeId', e.target.value)}
                placeholder="dQw4w9WgXcQ"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMatchDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveMatch} className="gap-2">
              <Check className="size-4" /> {editingMatch ? 'Salvar alterações' : 'Adicionar jogo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG CONFIRMAR DELETE ─── */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover jogo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este jogo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && confirmDelete(deleteConfirm)}
              className="gap-2"
            >
              <Trash2 className="size-4" /> Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG EDITAR PONTUAÇÃO ─── */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar pontuação</DialogTitle>
            <DialogDescription>
              Defina manualmente o total de pontos de {editing?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="points">Pontos</Label>
            <Input
              id="points"
              type="number"
              min={0}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmEdit} className="gap-2">
              <Check className="size-4" /> Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
