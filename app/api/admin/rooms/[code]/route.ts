import { NextResponse } from 'next/server'
import { isAdmin, normalizeRoomCode } from '@/lib/session'
import { clampSlide } from '@/lib/slides'
import { deleteActivityResponses, getDashboard, updateRoom } from '@/lib/store'

type Ctx = { params: Promise<{ code: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const code = normalizeRoomCode((await params).code)
  if (!code) return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
  try {
    const data = await getDashboard(code)
    if (!data) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    console.error('dashboard get failed', error)
    return NextResponse.json({ error: 'No se pudo cargar la sala' }, { status: 503 })
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const code = normalizeRoomCode((await params).code)
  if (!code) return NextResponse.json({ error: 'Código inválido' }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const patch: { currentSlide?: number; mode?: 'presentation' | 'game' } = {}

  if (typeof body.currentSlide === 'number' && Number.isFinite(body.currentSlide)) {
    patch.currentSlide = clampSlide(body.currentSlide)
    patch.mode = 'presentation'
  }
  if (body.mode === 'presentation' || body.mode === 'game') patch.mode = body.mode

  try {
    const room = await updateRoom(code, patch)
    if (!room) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
    return NextResponse.json({ ok: true, room })
  } catch (error) {
    console.error('dashboard patch failed', error)
    return NextResponse.json({ error: 'No se pudo actualizar la sala' }, { status: 503 })
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const code = normalizeRoomCode((await params).code)
  if (!code) return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
  const activity = new URL(request.url).searchParams.get('activity')
  if (!activity) return NextResponse.json({ error: 'Falta actividad' }, { status: 400 })
  try {
    await deleteActivityResponses(code, activity)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('reset activity failed', error)
    return NextResponse.json({ error: 'No se pudieron borrar las respuestas' }, { status: 503 })
  }
}
