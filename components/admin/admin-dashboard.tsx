'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Gamepad2, Loader2, LogOut, Plus, Presentation, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SLIDES } from '@/lib/slides'
import { SlideView } from '@/components/slides/slide-view'
import { ResultsBoard, type DashboardResponse } from './results-board'

async function readJson(res: Response): Promise<{ error?: string; code?: string }> {
  return res.json().catch(() => ({}))
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' })
  const json = await readJson(res)
  if (!res.ok) throw new Error(json.error ?? 'Error')
  return json
}

function CreateRoom() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function create() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/rooms', { method: 'POST' })
      const json = await readJson(res)
      if (res.ok && json.code) {
        router.push(`/admin?room=${json.code}`)
        return
      }
      setError(json.error ?? 'No se pudo crear la sala')
    } catch {
      setError('No se pudo crear la sala')
    }
    setPending(false)
  }
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-grid px-6 text-center">
      <h1 className="text-3xl font-bold">Panel docente</h1>
      <p className="max-w-md text-muted-foreground">Creá una sala nueva y compartí el código con tus estudiantes.</p>
      {error && (
        <p role="alert" className="max-w-md rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button size="lg" onClick={create} disabled={pending} className="h-12 px-6 font-bold">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Plus className="size-4" aria-hidden />}
        Crear sala
      </Button>
    </main>
  )
}

export function AdminDashboard({ roomCode }: { roomCode: string | null }) {
  if (!roomCode) return <CreateRoom />
  return <RoomControl code={roomCode} />
}

function RoomControl({ code }: { code: string }) {
  const router = useRouter()
  const url = `/api/admin/rooms/${code}`
  const { data, mutate } = useSWR<DashboardResponse>(url, fetcher, { refreshInterval: 1500 })
  const [busy, setBusy] = useState(false)

  async function patch(body: { currentSlide?: number; mode?: 'presentation' | 'game' }) {
    if (!data) return
    setBusy(true)
    const optimistic: DashboardResponse = {
      ...data,
      room: {
        ...data.room,
        ...(body.currentSlide !== undefined ? { currentSlide: body.currentSlide, mode: 'presentation' as const } : {}),
        ...(body.mode ? { mode: body.mode } : {}),
      },
    }
    try {
      await mutate(
        async () => {
          const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
          const json = await readJson(res)
          if (!res.ok) throw new Error(json.error ?? 'No se pudo actualizar')
          return fetcher(url)
        },
        { optimisticData: optimistic, rollbackOnError: true, revalidate: false },
      )
    } finally {
      setBusy(false)
    }
  }

  async function resetActivity(activity: string) {
    await fetch(`${url}?activity=${activity}`, { method: 'DELETE' })
    mutate()
  }

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' })
    router.refresh()
  }

  if (!data) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Cargando" />
      </main>
    )
  }

  const current = data.room.currentSlide
  const slide = SLIDES[current]
  const isGame = data.room.mode === 'game'

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
        <h1 className="font-bold">Panel docente</h1>
        <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Código</span>
          <span className="font-mono text-lg font-bold tracking-widest text-primary">{code}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-sm" aria-live="polite">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex size-2.5 rounded-full bg-success" />
          </span>
          <Users className="size-4 text-muted-foreground" aria-hidden />
          <span className="font-mono font-bold">{data.onlineCount}</span>
          <span className="text-muted-foreground">conectados</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
            <Plus className="size-4" aria-hidden />
            Nueva sala
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Cerrar sesión">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <div className="grid flex-1 gap-6 p-4 md:p-6 xl:grid-cols-[1fr_380px]">
        <section className="flex min-w-0 flex-col gap-4" aria-label="Control de diapositivas">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="lg" onClick={() => patch({ currentSlide: current - 1 })} disabled={busy || current === 0}>
              <ChevronLeft className="size-4" aria-hidden />
              Anterior
            </Button>
            <Button variant="outline" size="lg" onClick={() => patch({ currentSlide: current + 1 })} disabled={busy || current === SLIDES.length - 1}>
              Siguiente
              <ChevronRight className="size-4" aria-hidden />
            </Button>
            <Button
              size="lg"
              disabled={busy || !slide.activity}
              onClick={() => patch({ mode: isGame ? 'presentation' : 'game' })}
              className={cn(
                'ml-auto h-11 px-5 font-bold',
                isGame ? 'bg-destructive text-white hover:bg-destructive/90 glow-destructive' : 'bg-accent text-accent-foreground hover:bg-accent/90',
              )}
            >
              {isGame ? <Presentation className="size-4" aria-hidden /> : <Gamepad2 className="size-4" aria-hidden />}
              {isGame ? 'VOLVER A MODO PRESENTACIÓN' : 'ACTIVAR TIEMPO DE JUEGO'}
            </Button>
          </div>
          {!slide.activity && <p className="text-xs text-muted-foreground">Esta diapositiva no tiene juego asociado.</p>}

          <SlideView index={current} compact />

          <nav aria-label="Miniaturas" className="grid grid-cols-5 gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.number}
                type="button"
                onClick={() => patch({ currentSlide: i })}
                aria-current={i === current ? 'true' : undefined}
                className={cn(
                  'flex aspect-video flex-col justify-between rounded-xl border p-2 text-left transition-all',
                  i === current ? 'border-primary bg-primary/10 glow-primary' : 'border-border bg-card hover:border-primary/40',
                )}
              >
                <span className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                  {s.number}
                  {s.activity && <Gamepad2 className="size-3 text-accent" aria-label="Tiene juego" />}
                </span>
                <span className="line-clamp-2 text-xs font-medium leading-tight">{s.short}</span>
              </button>
            ))}
          </nav>
        </section>

        <ResultsBoard data={data} onReset={resetActivity} />
      </div>
    </div>
  )
}
