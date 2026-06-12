import type { Match, Prediction } from './data'

export function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

/**
 * Pontuação de um palpite contra o resultado de um jogo finalizado.
 * - Acertar vencedor + placar exato: 3 pts
 * - Acertar apenas o vencedor (ou empate): 1 pt
 */
export function scorePrediction(match: Match, prediction?: Prediction): number | null {
  if (match.status !== 'finished' || match.homeScore === null || match.awayScore === null)
    return null
  if (!prediction) return 0

  const exact = prediction.home === match.homeScore && prediction.away === match.awayScore
  if (exact) return 3

  const realOutcome = Math.sign(match.homeScore - match.awayScore)
  const guessOutcome = Math.sign(prediction.home - prediction.away)
  if (realOutcome === guessOutcome) return 1

  return 0
}
