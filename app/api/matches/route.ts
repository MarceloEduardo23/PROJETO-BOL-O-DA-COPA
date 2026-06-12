import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

function rowToMatch(r: Record<string, unknown>) {
  return {
    id: r.id,
    homeTeam: { id: r.home_id, name: r.home_name, code: r.home_code, flag: r.home_flag },
    awayTeam: { id: r.away_id, name: r.away_name, code: r.away_code, flag: r.away_flag },
    kickoff: r.kickoff,
    group: r.group_name,
    stage: r.stage,
    round: r.round,
    status: r.status,
    homeScore: r.home_score ?? null,
    awayScore: r.away_score ?? null,
    minute: r.minute ?? null,
    venue: r.venue,
    youtubeId: r.youtube_id ?? null,
  }
}

// GET /api/matches
export async function GET() {
  const rows = await sql`SELECT * FROM matches ORDER BY kickoff ASC`
  return NextResponse.json(rows.map(rowToMatch))
}

// POST /api/matches  (admin)
export async function POST(req: NextRequest) {
  const m = await req.json()
  await sql`
    INSERT INTO matches (
      id, home_id, home_name, home_code, home_flag,
      away_id, away_name, away_code, away_flag,
      kickoff, group_name, stage, round, status,
      home_score, away_score, minute, venue, youtube_id
    ) VALUES (
      ${m.id},
      ${m.homeTeam.id}, ${m.homeTeam.name}, ${m.homeTeam.code}, ${m.homeTeam.flag},
      ${m.awayTeam.id}, ${m.awayTeam.name}, ${m.awayTeam.code}, ${m.awayTeam.flag},
      ${m.kickoff}, ${m.group}, ${m.stage}, ${m.round ?? 1}, ${m.status ?? 'scheduled'},
      ${m.homeScore ?? null}, ${m.awayScore ?? null}, ${m.minute ?? null},
      ${m.venue ?? ''}, ${m.youtubeId ?? null}
    )
  `
  return NextResponse.json({ ok: true })
}
