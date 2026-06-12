import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/predictions?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({})

  const rows = await sql`
    SELECT match_id, home, away, saved_at FROM predictions WHERE user_id = ${userId}
  `
  const map: Record<string, unknown> = {}
  for (const r of rows) {
    map[r.match_id as string] = {
      matchId: r.match_id,
      home: r.home,
      away: r.away,
      savedAt: r.saved_at,
    }
  }
  return NextResponse.json(map)
}

// POST /api/predictions
export async function POST(req: NextRequest) {
  const { userId, matchId, home, away } = await req.json()
  await sql`
    INSERT INTO predictions (user_id, match_id, home, away)
    VALUES (${userId}, ${matchId}, ${home}, ${away})
    ON CONFLICT (user_id, match_id)
    DO UPDATE SET home = ${home}, away = ${away}, saved_at = NOW()
  `
  return NextResponse.json({ ok: true })
}
