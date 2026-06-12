import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// POST /api/auth  — login ou register dependendo de ?action=
export async function POST(req: NextRequest) {
  const { action, name, email, password } = await req.json()

  if (action === 'login') {
    const rows = await sql`
      SELECT id, name, email, avatar, is_admin, points, exact_hits, result_hits, pool_group
      FROM users WHERE LOWER(email) = LOWER(${email}) AND password = ${password}
      LIMIT 1
    `
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'E-mail ou senha incorretos.' }, { status: 401 })
    }
    const u = rows[0]
    return NextResponse.json({
      ok: true,
      user: {
        id: u.id, name: u.name, email: u.email,
        avatar: u.avatar, isAdmin: u.is_admin,
      },
    })
  }

  if (action === 'register') {
    const exists = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`
    if (exists.length > 0) {
      return NextResponse.json({ ok: false, error: 'Este e-mail já está em uso.' }, { status: 409 })
    }
    const id = `u${Date.now()}`
    await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (${id}, ${name.trim()}, ${email.trim()}, ${password})
    `
    return NextResponse.json({
      ok: true,
      user: { id, name: name.trim(), email: email.trim(), avatar: null, isAdmin: false },
    })
  }

  return NextResponse.json({ ok: false, error: 'Ação inválida.' }, { status: 400 })
}
