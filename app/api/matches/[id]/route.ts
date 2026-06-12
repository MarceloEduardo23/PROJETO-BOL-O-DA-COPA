import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// PATCH /api/matches/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const m = await req.json()

  // Verifica o estado atual da partida antes de atualizar
  const [current] = await sql`SELECT status FROM matches WHERE id = ${id}`
  const wasAlreadyFinished = current?.status === 'finished'

  await sql`
    UPDATE matches SET
      home_id    = COALESCE(${m.homeTeam?.id    ?? null}, home_id),
      home_name  = COALESCE(${m.homeTeam?.name  ?? null}, home_name),
      home_code  = COALESCE(${m.homeTeam?.code  ?? null}, home_code),
      home_flag  = COALESCE(${m.homeTeam?.flag  ?? null}, home_flag),
      away_id    = COALESCE(${m.awayTeam?.id    ?? null}, away_id),
      away_name  = COALESCE(${m.awayTeam?.name  ?? null}, away_name),
      away_code  = COALESCE(${m.awayTeam?.code  ?? null}, away_code),
      away_flag  = COALESCE(${m.awayTeam?.flag  ?? null}, away_flag),
      kickoff    = COALESCE(${m.kickoff         ?? null}::timestamptz, kickoff),
      group_name = COALESCE(${m.group           ?? null}, group_name),
      stage      = COALESCE(${m.stage           ?? null}, stage),
      round      = COALESCE(${m.round           ?? null}, round),
      status     = COALESCE(${m.status          ?? null}, status),
      home_score = COALESCE(${m.homeScore       ?? null}, home_score),
      away_score = COALESCE(${m.awayScore       ?? null}, away_score),
      minute     = COALESCE(${m.minute          ?? null}, minute),
      venue      = COALESCE(${m.venue           ?? null}, venue),
      youtube_id = COALESCE(${m.youtubeId       ?? null}, youtube_id)
    WHERE id = ${id}
  `

  // Só calcula pontos quando a partida é encerrada pela primeira vez
  const isBeingFinished =
    m.status === 'finished' &&
    !wasAlreadyFinished &&
    m.homeScore !== null &&
    m.homeScore !== undefined &&
    m.awayScore !== null &&
    m.awayScore !== undefined

  if (isBeingFinished) {
    const homeScore = m.homeScore as number
    const awayScore = m.awayScore as number
    const realOutcome = Math.sign(homeScore - awayScore)

    // Busca todos os palpites para este jogo
    const predictions = await sql`
      SELECT user_id, home, away FROM predictions WHERE match_id = ${id}
    `

    for (const pred of predictions) {
      const predHome = pred.home as number
      const predAway = pred.away as number
      let points = 0

      const exact = predHome === homeScore && predAway === awayScore
      if (exact) {
        points = 3
      } else {
        const guessOutcome = Math.sign(predHome - predAway)
        if (realOutcome === guessOutcome) {
          points = 1
        }
      }

      const exactHit = exact ? 1 : 0
      const resultHit = !exact && points === 1 ? 1 : 0

      await sql`
        UPDATE users SET
          points      = points + ${points},
          exact_hits  = exact_hits + ${exactHit},
          result_hits = result_hits + ${resultHit}
        WHERE id = ${pred.user_id}
      `
    }
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/matches/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM matches WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
