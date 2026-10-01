'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Presentation, Radio, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SlideView } from '@/components/slides/slide-view'
import { ActivityRenderer } from '@/components/games/activity-renderer'
import { SLIDES } from '@/lib/slides'

type StudentState = {
  me: { nickname: string }
  room: { code: string; currentSlide: number; mode: 'presentation' | 'game' }
  online: number
  answered: { activity: string; correct: number; total: number }[]
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new HttpError(res.status, (await res.json().catch(() => ({}))).error ?? 'Error')
  return res.json()
}

export function StudentApp() {
  const router = useRouter()
  const { data, error } = useSWR<StudentState>('/api/student/state', fetcher, {
    refreshInterval: 1500,
    revalidateOnFocus: true,
    onError: (err) => {
      if (err instanceof HttpError && (err.status === 401 || err.status === 404)) router.replace('/join')
    },
  })

  async function leave() {
    await fetch('/api/join', { method: 'DELETE' })
    router.replace('/join')
  }

  if (!data) {
    return (
      <main className="flex min-h-dvh items-center justify-center gap-3 text-muted-foreground">
        {error ? <p>Reconectando...</p> : <Loader2 className="size-6 animate-spin" aria-label="Cargando" />}
      </main>
    )
  }

  const slide = SLIDES[data.room.currentSlide]
  const inGame = data.room.mode === 'game' && slide?.activity

  return (
    <div className="flex min-h-dvh flex-col bg-grid">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 md:px-8">
        <span className="font-semibold text-primary">Sala {data.room.code}</span>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-3.5" aria-hidden />
          {data.online} en línea
        </span>
        <span className="ml-auto truncate text-base font-semibold">{data.me.nickname}</span>
        <Button variant="ghost" size="icon" onClick={leave} aria-label="Salir de la sala">
          <LogOut className="size-4" />
        </Button>
      </header>

      <main className="flex w-full flex-1 flex-col gap-3 p-3 md:gap-4 md:p-6">
        <div className="flex items-center gap-2 text-base" aria-live="polite">
          {inGame ? (
            <span className="flex items-center gap-2 font-semibold text-accent">
              <Radio className="size-4 animate-pulse" aria-hidden />
              ¡Tiempo de juego activado!
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Presentation className="size-4" aria-hidden />
              Mirando la presentación
            </span>
          )}
        </div>
        {inGame && slide.activity ? (
          <ActivityRenderer key={`${data.room.currentSlide}-${slide.activity}`} activity={slide.activity} />
        ) : (
          <SlideView index={data.room.currentSlide} />
        )}
      </main>
    </div>
  )
}
