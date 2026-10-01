import { NextResponse } from 'next/server'
import { gradeActivity, isActivityId } from '@/lib/activities'
import { getParticipantId } from '@/lib/session'
import { SLIDES } from '@/lib/slides'
import { getParticipant, getRoom, upsertResponse } from '@/lib/store'

export async function POST(request: Request) {
  const id = await getParticipantId()
  if (!id) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 })

  try {
    const me = await getParticipant(id)
    if (!me) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    if (!isActivityId(body?.activity)) return NextResponse.json({ error: 'Actividad inválida' }, { status: 400 })

    const room = await getRoom(me.roomCode)
    const slide = room ? SLIDES[room.currentSlide] : null
    if (!room || room.mode !== 'game' || slide?.activity !== body.activity) {
      return NextResponse.json({ error: 'Esta actividad no está activa ahora.' }, { status: 409 })
    }

    const graded = gradeActivity(body.activity, body.data)
    if (!graded) return NextResponse.json({ error: 'Respuesta inválida' }, { status: 400 })

    await upsertResponse(me.roomCode, id, body.activity, graded)
    return NextResponse.json({ correct: graded.correct, total: graded.total })
  } catch (error) {
    console.error('submit response failed', error)
    return NextResponse.json({ error: 'No se pudo enviar tu respuesta' }, { status: 503 })
  }
}
