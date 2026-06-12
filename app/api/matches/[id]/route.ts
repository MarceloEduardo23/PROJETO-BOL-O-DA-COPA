import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// PATCH /api/matches/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const m = await req.json()

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
  return NextResponse.json({ ok: true })
}

// DELETE /api/matches/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM matches WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
