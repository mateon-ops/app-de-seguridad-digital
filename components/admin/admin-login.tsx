'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter()
  const [key, setKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const res = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
    const json = await res.json().catch(() => ({}))
    setPending(false)
    if (!res.ok) return setError(json.error ?? 'Error al ingresar')
    router.refresh()
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-grid px-6">
      <form onSubmit={onSubmit} className="animate-pop flex w-full max-w-sm flex-col gap-5 rounded-3xl border border-border bg-card p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-accent">
            <KeyRound className="size-7" aria-hidden />
          </span>
          <h1 className="text-2xl font-bold">Panel docente</h1>
          <p className="text-sm text-muted-foreground">Ingresá la clave master para controlar la clase.</p>
        </div>
        {!configured && (
          <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
            Falta configurar la variable ADMIN_MASTER_KEY en el proyecto (Settings → Vars).
          </p>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="master" className="text-sm font-medium">
            Clave master
          </label>
          <input
            id="master"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            autoComplete="current-password"
            className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
          />
        </div>
        {error && (
          <p role="alert" className="animate-shake rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending || !configured} className="h-12 font-bold">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Ingresar
        </Button>
      </form>
    </main>
  )
}
