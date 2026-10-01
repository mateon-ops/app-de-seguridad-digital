import { and, eq, gt, sql } from 'drizzle-orm'
import { db as postgres } from '@/lib/db'
import { participants, responses, rooms } from '@/lib/db/schema'
import { SLIDES } from '@/lib/slides'

export const ONLINE_WINDOW_SECONDS = 15

export type RoomState = {
  code: string
  currentSlide: number
  mode: 'presentation' | 'game'
}

export type ParticipantRow = {
  id: string
  roomCode: string
  nickname: string
  lastSeen: Date
  createdAt: Date
}

export type ResponseRow = {
  participantId: string
  activity: string
  correct: number
  total: number
  payload: Record<string, unknown>
}

type RoomRow = RoomState & { createdAt: Date; updatedAt: Date }

type Memory = {
  rooms: Map<string, RoomRow>
  participants: Map<string, ParticipantRow>
  responses: Map<string, ResponseRow & { roomCode: string; id: number }>
  responseSeq: number
}

const globalStore = globalThis as unknown as { memoryClassroom?: Memory }

function memory(): Memory {
  globalStore.memoryClassroom ??= {
    rooms: new Map(),
    participants: new Map(),
    responses: new Map(),
    responseSeq: 1,
  }
  return globalStore.memoryClassroom
}

function usePostgres() {
  return Boolean(process.env.DATABASE_URL && postgres)
}

function db() {
  if (!postgres) throw new Error('DATABASE_URL no configurada')
  return postgres
}

function asMode(value: string | undefined): 'presentation' | 'game' {
  return value === 'game' ? 'game' : 'presentation'
}

function isOnline(lastSeen: Date) {
  return Date.now() - lastSeen.getTime() < ONLINE_WINDOW_SECONDS * 1000
}

function responseKey(roomCode: string, participantId: string, activity: string) {
  return `${roomCode}:${participantId}:${activity}`
}

export async function createRoom(code: string): Promise<string | null> {
  if (!usePostgres()) {
    const mem = memory()
    if (mem.rooms.has(code)) return null
    const now = new Date()
    mem.rooms.set(code, { code, currentSlide: 0, mode: 'presentation', createdAt: now, updatedAt: now })
    return code
  }
  const inserted = await db().insert(rooms).values({ code }).onConflictDoNothing().returning({ code: rooms.code })
  return inserted[0]?.code ?? null
}

export async function getRoom(code: string): Promise<RoomState | null> {
  if (!usePostgres()) {
    const room = memory().rooms.get(code)
    if (!room) return null
    return { code: room.code, currentSlide: room.currentSlide, mode: room.mode }
  }
  const [room] = await db().select().from(rooms).where(eq(rooms.code, code)).limit(1)
  if (!room) return null
  return { code: room.code, currentSlide: room.currentSlide, mode: asMode(room.mode) }
}

export async function updateRoom(code: string, patch: { currentSlide?: number; mode?: 'presentation' | 'game' }) {
  if (!usePostgres()) {
    const mem = memory()
    const room = mem.rooms.get(code)
    if (!room) return null
    if (patch.currentSlide !== undefined) room.currentSlide = patch.currentSlide
    if (patch.mode) room.mode = patch.mode
    room.updatedAt = new Date()
    return { code: room.code, currentSlide: room.currentSlide, mode: room.mode }
  }
  const update: { currentSlide?: number; mode?: string; updatedAt: Date } = { updatedAt: new Date() }
  if (patch.currentSlide !== undefined) update.currentSlide = patch.currentSlide
  if (patch.mode) update.mode = patch.mode
  const [room] = await db().update(rooms).set(update).where(eq(rooms.code, code)).returning()
  if (!room) return null
  return { code: room.code, currentSlide: room.currentSlide, mode: asMode(room.mode) }
}

export async function addParticipant(roomCode: string, nickname: string) {
  if (!usePostgres()) {
    const id = crypto.randomUUID()
    const now = new Date()
    const row: ParticipantRow = { id, roomCode, nickname, lastSeen: now, createdAt: now }
    memory().participants.set(id, row)
    return { id }
  }
  const [p] = await db().insert(participants).values({ roomCode, nickname }).returning({ id: participants.id })
  return p
}

export async function getParticipant(id: string) {
  if (!usePostgres()) return memory().participants.get(id) ?? null
  const [p] = await db().select().from(participants).where(eq(participants.id, id)).limit(1)
  return p ?? null
}

export async function touchParticipant(id: string) {
  if (!usePostgres()) {
    const p = memory().participants.get(id)
    if (!p) return null
    p.lastSeen = new Date()
    return { id: p.id, nickname: p.nickname, roomCode: p.roomCode }
  }
  const [p] = await db()
    .update(participants)
    .set({ lastSeen: new Date() })
    .where(eq(participants.id, id))
    .returning({ id: participants.id, nickname: participants.nickname, roomCode: participants.roomCode })
  return p ?? null
}

export async function countOnline(code: string) {
  if (!usePostgres()) {
    return [...memory().participants.values()].filter((p) => p.roomCode === code && isOnline(p.lastSeen)).length
  }
  const [row] = await db()
    .select({ n: sql<number>`count(*)::int` })
    .from(participants)
    .where(
      and(
        eq(participants.roomCode, code),
        gt(participants.lastSeen, sql`now() - make_interval(secs => ${ONLINE_WINDOW_SECONDS})`),
      ),
    )
  return row?.n ?? 0
}

export async function listMyResponses(roomCode: string, participantId: string) {
  if (!usePostgres()) {
    return [...memory().responses.values()]
      .filter((r) => r.roomCode === roomCode && r.participantId === participantId)
      .map((r) => ({ activity: r.activity, correct: r.correct, total: r.total }))
  }
  return db()
    .select({ activity: responses.activity, correct: responses.correct, total: responses.total })
    .from(responses)
    .where(and(eq(responses.roomCode, roomCode), eq(responses.participantId, participantId)))
}

export async function upsertResponse(
  roomCode: string,
  participantId: string,
  activity: string,
  graded: { correct: number; total: number; payload: Record<string, unknown> },
) {
  if (!usePostgres()) {
    const mem = memory()
    const key = responseKey(roomCode, participantId, activity)
    const existing = mem.responses.get(key)
    mem.responses.set(key, {
      id: existing?.id ?? mem.responseSeq++,
      roomCode,
      participantId,
      activity,
      correct: graded.correct,
      total: graded.total,
      payload: graded.payload,
    })
    return
  }
  await db()
    .insert(responses)
    .values({ roomCode, participantId, activity, ...graded })
    .onConflictDoUpdate({
      target: [responses.roomCode, responses.participantId, responses.activity],
      set: { correct: graded.correct, total: graded.total, payload: graded.payload, updatedAt: new Date() },
    })
}

export async function deleteActivityResponses(roomCode: string, activity: string) {
  if (!usePostgres()) {
    const mem = memory()
    for (const [key, row] of mem.responses) {
      if (row.roomCode === roomCode && row.activity === activity) mem.responses.delete(key)
    }
    return
  }
  await db().delete(responses).where(and(eq(responses.roomCode, roomCode), eq(responses.activity, activity)))
}

export async function getDashboard(code: string) {
  const room = await getRoom(code)
  if (!room) return null

  if (!usePostgres()) {
    const people = [...memory().participants.values()]
      .filter((p) => p.roomCode === code)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((p) => ({ id: p.id, nickname: p.nickname, online: isOnline(p.lastSeen) }))
    const names = new Map(people.map((p) => [p.id, p.nickname]))
    const answers = [...memory().responses.values()]
      .filter((r) => r.roomCode === code)
      .map((a) => ({ ...a, nickname: names.get(a.participantId) ?? 'Anónimo' }))
    return {
      room,
      slide: SLIDES[room.currentSlide],
      participants: people,
      onlineCount: people.filter((p) => p.online).length,
      responses: answers,
    }
  }

  const onlineSince = sql`now() - make_interval(secs => ${ONLINE_WINDOW_SECONDS})`
  const [people, answers] = await Promise.all([
    db()
      .select({
        id: participants.id,
        nickname: participants.nickname,
        online: sql<boolean>`${participants.lastSeen} > ${onlineSince}`,
      })
      .from(participants)
      .where(eq(participants.roomCode, code))
      .orderBy(participants.createdAt),
    db()
      .select({
        participantId: responses.participantId,
        activity: responses.activity,
        correct: responses.correct,
        total: responses.total,
        payload: responses.payload,
      })
      .from(responses)
      .where(eq(responses.roomCode, code)),
  ])

  const names = new Map(people.map((p) => [p.id, p.nickname]))
  return {
    room,
    slide: SLIDES[room.currentSlide],
    participants: people,
    onlineCount: people.filter((p) => p.online).length,
    responses: answers.map((a) => ({ ...a, nickname: names.get(a.participantId) ?? 'Anónimo' })),
  }
}
