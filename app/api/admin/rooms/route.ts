import { NextResponse } from 'next/server'
import { generateRoomCode, isAdmin } from '@/lib/session'
import { createRoom } from '@/lib/store'

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Falta configurar DATABASE_URL en Vercel para guardar las salas.' }, { status: 503 })
  }

  try {
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = generateRoomCode()
      const created = await createRoom(code)
      if (created) return NextResponse.json({ code: created })
    }
    return NextResponse.json({ error: 'No se pudo generar la sala' }, { status: 500 })
  } catch (error) {
    console.error('create room failed', error)
    return NextResponse.json({ error: 'No se pudo crear la sala. Revisá la conexión a la base de datos.' }, { status: 503 })
  }
}
