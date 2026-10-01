import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminLogin } from '@/components/admin/admin-login'
import { getRoom } from '@/lib/room-data'
import { isAdmin, isAdminConfigured, normalizeRoomCode } from '@/lib/session'

export const metadata: Metadata = { title: 'Panel docente | Escudo Digital' }

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ room?: string }> }) {
  if (!(await isAdmin())) return <AdminLogin configured={isAdminConfigured()} />

  const code = normalizeRoomCode((await searchParams).room)
  const room = code ? await getRoom(code) : null
  return <AdminDashboard roomCode={room?.code ?? null} />
}
