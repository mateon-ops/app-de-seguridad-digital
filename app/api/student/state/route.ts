import { NextResponse } from 'next/server'
import { getParticipantId } from '@/lib/session'
import { countOnline, getRoom, listMyResponses, touchParticipant } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const id = await getParticipantId()
  if (!id) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 })

  try {
    const me = await touchParticipant(id)
    if (!me) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 })

    const [room, online, mine] = await Promise.all([
      getRoom(me.roomCode),
      countOnline(me.roomCode),
      listMyResponses(me.roomCode, id),
    ])
    if (!room) return NextResponse.json({ error: 'La sala ya no existe' }, { status: 404 })

    return NextResponse.json({ me: { nickname: me.nickname }, room, online, answered: mine })
  } catch (error) {
    console.error('student state failed', error)
    return NextResponse.json({ error: 'No se pudo cargar tu sala' }, { status: 503 })
  }
}
