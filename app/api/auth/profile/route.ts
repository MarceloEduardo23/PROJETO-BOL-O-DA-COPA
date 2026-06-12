import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  const { userId, name, avatar } = await req.json()
  if (!userId) return NextResponse.json({ ok: false }, { status: 400 })
  await sql`
    UPDATE users SET
      name   = COALESCE(${name ?? null}, name),
      avatar = COALESCE(${avatar ?? null}, avatar)
    WHERE id = ${userId}
  `
  return NextResponse.json({ ok: true })
}
