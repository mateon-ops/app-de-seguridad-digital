import { JoinForm } from '@/components/join-form'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams
  return (
    <main className="flex min-h-dvh items-center justify-center bg-grid px-6 py-16">
      <JoinForm initialCode={typeof code === 'string' ? code.toUpperCase().slice(0, 8) : ''} />
    </main>
  )
}
