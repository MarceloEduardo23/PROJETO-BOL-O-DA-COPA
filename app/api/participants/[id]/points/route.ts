import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// PATCH /api/participants/[id]/points
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { delta, set } = await req.json()

  if (typeof set === 'number') {
    await sql`UPDATE users SET points = GREATEST(0, ${set}) WHERE id = ${id}`
  } else if (typeof delta === 'number') {
    await sql`UPDATE users SET points = GREATEST(0, points + ${delta}) WHERE id = ${id}`
  }
  return NextResponse.json({ ok: true })
}
