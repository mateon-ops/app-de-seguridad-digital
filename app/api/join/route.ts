import { NextResponse } from 'next/server'
import { sanitizeText } from '@/lib/activities'
import { cookieOptions, normalizeRoomCode, PARTICIPANT_COOKIE } from '@/lib/session'
import { addParticipant, getRoom } from '@/lib/store'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const nickname = sanitizeText(body?.nickname, 24)
  const code = normalizeRoomCode(body?.code)

  if (nickname.length < 2) return NextResponse.json({ error: 'Tu apodo necesita al menos 2 letras.' }, { status: 400 })
  if (!code) return NextResponse.json({ error: 'El código de sala no es válido.' }, { status: 400 })

  try {
    const room = await getRoom(code)
    if (!room) return NextResponse.json({ error: 'No encontramos esa sala. Revisá el código.' }, { status: 404 })

    const p = await addParticipant(code, nickname)
    if (!p) return NextResponse.json({ error: 'No se pudo entrar a la sala.' }, { status: 500 })

    const res = NextResponse.json({ ok: true })
    res.cookies.set(PARTICIPANT_COOKIE, p.id, cookieOptions(60 * 60 * 8))
    return res
  } catch (error) {
    console.error('join failed', error)
    return NextResponse.json({ error: 'No se pudo entrar a la sala.' }, { status: 503 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(PARTICIPANT_COOKIE, '', cookieOptions(0))
  return res
}
