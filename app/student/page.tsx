import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { StudentApp } from '@/components/student/student-app'
import { getParticipantId } from '@/lib/session'

export const metadata: Metadata = { title: 'Clase en vivo | Escudo Digital' }

export default async function StudentPage() {
  if (!(await getParticipantId())) redirect('/join')
  return <StudentApp />
}
