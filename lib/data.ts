export type Stage =
  | 'Fase de Grupos'
  | 'Oitavas de Final'
  | 'Quartas de Final'
  | 'Semifinal'
  | 'Final'

export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface Team {
  id: string
  name: string
  code: string
  flag: string // emoji da bandeira (usado apenas como dado, renderizado em <span>)
}

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  kickoff: string // ISO
  group: string
  stage: Stage
  round: number
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
  minute: number | null
  venue: string
  youtubeId: string | null
}

export interface Prediction {
  matchId: string
  home: number
  away: number
  savedAt: string
}

export interface Participant {
  id: string
  name: string
  avatar: string | null
  points: number
  exactHits: number
  resultHits: number
  group: string // grupo do bolão (turma)
}

export const TEAMS: Record<string, Team> = {
  bra: { id: 'bra', name: 'Brasil', code: 'BRA', flag: '🇧🇷' },
  arg: { id: 'arg', name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
  fra: { id: 'fra', name: 'França', code: 'FRA', flag: '🇫🇷' },
  esp: { id: 'esp', name: 'Espanha', code: 'ESP', flag: '🇪🇸' },
  eng: { id: 'eng', name: 'Inglaterra', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  ger: { id: 'ger', name: 'Alemanha', code: 'GER', flag: '🇩🇪' },
  por: { id: 'por', name: 'Portugal', code: 'POR', flag: '🇵🇹' },
  ned: { id: 'ned', name: 'Holanda', code: 'NED', flag: '🇳🇱' },
  mex: { id: 'mex', name: 'México', code: 'MEX', flag: '🇲🇽' },
  usa: { id: 'usa', name: 'Estados Unidos', code: 'USA', flag: '🇺🇸' },
  can: { id: 'can', name: 'Canadá', code: 'CAN', flag: '🇨🇦' },
  uru: { id: 'uru', name: 'Uruguai', code: 'URU', flag: '🇺🇾' },
  cro: { id: 'cro', name: 'Croácia', code: 'CRO', flag: '🇭🇷' },
  jpn: { id: 'jpn', name: 'Japão', code: 'JPN', flag: '🇯🇵' },
  mar: { id: 'mar', name: 'Marrocos', code: 'MAR', flag: '🇲🇦' },
  bel: { id: 'bel', name: 'Bélgica', code: 'BEL', flag: '🇧🇪' },
}

// Gera horários relativos ao "agora" para simular jogos de hoje
function iso(offsetMinutes: number): string {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString()
}

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'm1',
    homeTeam: TEAMS.bra,
    awayTeam: TEAMS.cro,
    kickoff: iso(-58),
    group: 'Grupo A',
    stage: 'Fase de Grupos',
    round: 1,
    status: 'live',
    homeScore: 2,
    awayScore: 1,
    minute: 58,
    venue: 'MetLife Stadium, Nova York',
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    id: 'm2',
    homeTeam: TEAMS.arg,
    awayTeam: TEAMS.mex,
    kickoff: iso(-22),
    group: 'Grupo B',
    stage: 'Fase de Grupos',
    round: 1,
    status: 'live',
    homeScore: 0,
    awayScore: 0,
    minute: 22,
    venue: 'Estadio Azteca, Cidade do México',
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    id: 'm3',
    homeTeam: TEAMS.fra,
    awayTeam: TEAMS.usa,
    kickoff: iso(45),
    group: 'Grupo C',
    stage: 'Fase de Grupos',
    round: 1,
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    minute: null,
    venue: 'SoFi Stadium, Los Angeles',
    youtubeId: null,
  },
  {
    id: 'm4',
    homeTeam: TEAMS.esp,
    awayTeam: TEAMS.jpn,
    kickoff: iso(120),
    group: 'Grupo D',
    stage: 'Fase de Grupos',
    round: 1,
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    minute: null,
    venue: 'BMO Field, Toronto',
    youtubeId: null,
  },
  {
    id: 'm5',
    homeTeam: TEAMS.eng,
    awayTeam: TEAMS.mar,
    kickoff: iso(180),
    group: 'Grupo E',
    stage: 'Fase de Grupos',
    round: 1,
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    minute: null,
    venue: 'Lumen Field, Seattle',
    youtubeId: null,
  },
  {
    id: 'm6',
    homeTeam: TEAMS.por,
    awayTeam: TEAMS.uru,
    kickoff: iso(-180),
    group: 'Grupo F',
    stage: 'Fase de Grupos',
    round: 1,
    status: 'finished',
    homeScore: 3,
    awayScore: 1,
    minute: 90,
    venue: 'Hard Rock Stadium, Miami',
    youtubeId: null,
  },
  {
    id: 'm7',
    homeTeam: TEAMS.ger,
    awayTeam: TEAMS.bel,
    kickoff: iso(-240),
    group: 'Grupo G',
    stage: 'Fase de Grupos',
    round: 1,
    status: 'finished',
    homeScore: 1,
    awayScore: 1,
    minute: 90,
    venue: 'AT&T Stadium, Dallas',
    youtubeId: null,
  },
  {
    id: 'm8',
    homeTeam: TEAMS.ned,
    awayTeam: TEAMS.can,
    kickoff: iso(240),
    group: 'Grupo H',
    stage: 'Fase de Grupos',
    round: 1,
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    minute: null,
    venue: 'BC Place, Vancouver',
    youtubeId: null,
  },
]

export const INITIAL_PARTICIPANTS: Participant[] = [
  { id: 'u1', name: 'Você', avatar: null, points: 14, exactHits: 3, resultHits: 5, group: 'Geral' },
  { id: 'u2', name: 'Carlos Mendes', avatar: null, points: 21, exactHits: 5, resultHits: 6, group: 'Geral' },
  { id: 'u3', name: 'Ana Beatriz', avatar: null, points: 19, exactHits: 4, resultHits: 7, group: 'Amigos do Trabalho' },
  { id: 'u4', name: 'João Pedro', avatar: null, points: 17, exactHits: 4, resultHits: 5, group: 'Família' },
  { id: 'u5', name: 'Mariana Costa', avatar: null, points: 16, exactHits: 3, resultHits: 7, group: 'Amigos do Trabalho' },
  { id: 'u6', name: 'Rafael Lima', avatar: null, points: 12, exactHits: 2, resultHits: 6, group: 'Família' },
  { id: 'u7', name: 'Fernanda Souza', avatar: null, points: 11, exactHits: 2, resultHits: 5, group: 'Geral' },
  { id: 'u8', name: 'Lucas Almeida', avatar: null, points: 9, exactHits: 1, resultHits: 6, group: 'Amigos do Trabalho' },
  { id: 'u9', name: 'Beatriz Rocha', avatar: null, points: 7, exactHits: 1, resultHits: 4, group: 'Família' },
  { id: 'u10', name: 'Gabriel Nunes', avatar: null, points: 5, exactHits: 0, resultHits: 5, group: 'Geral' },
]

export const POOL_GROUPS = ['Geral', 'Amigos do Trabalho', 'Família']
