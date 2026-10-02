'use client'

import { useState } from 'react'
import { Gamepad2, Loader2, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ActivityId } from '@/lib/activities'
import { sfx } from '@/lib/sounds'

export type SubmitResult = { correct: number; total: number }

export async function submitActivity(activity: ActivityId, data: unknown): Promise<SubmitResult> {
  const res = await fetch('/api/student/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activity, data }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error ?? 'No se pudo enviar tu respuesta')
  return json
}

export function useSubmit(activity: ActivityId) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SubmitResult | null>(null)

  async function submit(data: unknown) {
    setPending(true)
    setError(null)
    try {
      const r = await submitActivity(activity, data)
      setResult(r)
      if (r.total === 0 || r.correct === r.total) sfx.fanfare()
      else sfx.success()
      return r
    } catch (e) {
      setError((e as Error).message)
      sfx.error()
      return null
    } finally {
      setPending(false)
    }
  }

  return { submit, pending, error, result }
}

export function GameShell({
  title,
  instructions,
  children,
}: {
  title: string
  instructions: string
  children: React.ReactNode
}) {
  return (
    <section className="animate-pop flex min-h-0 w-full flex-1 flex-col gap-5 overflow-y-auto overscroll-contain rounded-3xl border border-accent/40 bg-card/60 p-5 md:p-8" aria-labelledby="game-title">
      <header className="flex flex-col gap-2">
        <span className="flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-1 font-mono text-sm font-bold text-accent-foreground">
          <Gamepad2 className="size-3.5" aria-hidden />
          TIEMPO DE JUEGO
        </span>
        <h2 id="game-title" className="text-3xl font-bold leading-tight md:text-4xl">
          {title}
        </h2>
        <p className="text-lg font-medium leading-relaxed text-foreground text-pretty">{instructions}</p>
      </header>
      {children}
    </section>
  )
}

export function SubmitBar({
  onSubmit,
  pending,
  disabled,
  error,
  result,
  label = 'Enviar respuesta',
}: {
  onSubmit: () => void
  pending: boolean
  disabled?: boolean
  error: string | null
  result: SubmitResult | null
  label?: string
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 text-lg sm:flex-row sm:items-center sm:justify-between">
      <div aria-live="polite" className="text-lg">
        {error && <p className="text-destructive">{error}</p>}
        {result && result.total > 0 && (
          <p className="animate-pop flex items-center gap-2 font-semibold text-success">
            <Trophy className="size-4" aria-hidden />
            ¡Enviado!
          </p>
        )}
        {result && result.total === 0 && <p className="animate-pop font-semibold text-success">¡Voto enviado!</p>}
      </div>
      <Button size="lg" onClick={onSubmit} disabled={pending || disabled} className="font-semibold text-lg">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {result ? 'Volver a enviar' : label}
      </Button>
    </div>
  )
}
