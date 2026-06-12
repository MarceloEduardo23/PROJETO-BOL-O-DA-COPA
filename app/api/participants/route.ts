import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/participants
export async function GET() {
  const rows = await sql`
    SELECT id, name, avatar, points, exact_hits, result_hits, pool_group
    FROM users
    WHERE is_admin = FALSE
    ORDER BY points DESC, exact_hits DESC
  `
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      points: r.points,
      exactHits: r.exact_hits,
      resultHits: r.result_hits,
      group: r.pool_group,
    }))
  )
}
