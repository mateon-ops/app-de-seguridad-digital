import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'sd_admin'
export const PARTICIPANT_COOKIE = 'sd_participant'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function cookieOptions(maxAge: number) {
  const isDev = process.env.NODE_ENV === 'development'
  return {
    httpOnly: true,
    secure: true,
    sameSite: (isDev ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge,
  }
}

function adminToken() {
  const key = process.env.ADMIN_MASTER_KEY
  if (!key) return null
  return createHmac('sha256', key).update('seguridad-digital-admin-v1').digest('hex')
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_MASTER_KEY)
}

export function verifyMasterKey(candidate: string) {
  const key = process.env.ADMIN_MASTER_KEY
  if (!key || typeof candidate !== 'string') return false
  return safeEqual(candidate, key)
}

export function getAdminToken() {
  return adminToken()
}

export async function isAdmin() {
  const token = adminToken()
  if (!token) return false
  const value = (await cookies()).get(ADMIN_COOKIE)?.value
  return Boolean(value && safeEqual(value, token))
}

export async function getParticipantId() {
  const value = (await cookies()).get(PARTICIPANT_COOKIE)?.value
  return value && UUID_RE.test(value) ? value : null
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

export function normalizeRoomCode(value: unknown) {
  if (typeof value !== 'string') return null
  const code = value.trim().toUpperCase()
  return /^[A-Z0-9]{4,8}$/.test(code) ? code : null
}
