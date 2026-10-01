'use client'

import { useState } from 'react'
import { Loader2, Rocket, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sounds'

export function JoinForm({ initialCode }: { initialCode: string }) {
  const [nickname, setNickname] = useState('')
  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const res = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, code }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(json.error ?? 'No pudimos conectarte.')
      sfx.error()
      setPending(false)
      return
    }
    sfx.success()
    window.location.assign('/student')
  }

  return (
    <form onSubmit={onSubmit} className="animate-pop flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-border bg-card p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary glow-primary">
          <ShieldCheck className="size-7" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold">¡Sumate a la clase!</h1>
        <p className="text-sm text-muted-foreground">Poné tu apodo y el código de la sala.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="nickname" className="text-sm font-medium">
          Nombre o apodo
        </label>
        <input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, 24))}
          required
          minLength={2}
          autoComplete="nickname"
          placeholder="Ej: Lu_Emprende"
          className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="code" className="text-sm font-medium">
          Código de sala
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
          required
          minLength={4}
          autoComplete="off"
          placeholder="ABC123"
          className="rounded-xl border border-input bg-background px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] uppercase outline-none focus:border-primary"
        />
      </div>

      {error && (
        <p role="alert" className="animate-shake rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="h-12 text-base font-bold">
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Rocket className="size-5" aria-hidden />}
        Entrar
      </Button>
    </form>
  )
}
