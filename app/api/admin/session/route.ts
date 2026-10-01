import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, cookieOptions, getAdminToken, isAdminConfigured, verifyMasterKey } from '@/lib/session'

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Falta configurar ADMIN_MASTER_KEY en el proyecto.' }, { status: 500 })
  }
  const body = await request.json().catch(() => ({}))
  if (!verifyMasterKey(body?.key)) {
    await new Promise((r) => setTimeout(r, 600))
    return NextResponse.json({ error: 'Clave master incorrecta.' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, getAdminToken()!, cookieOptions(60 * 60 * 12))
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, '', cookieOptions(0))
  return res
}
