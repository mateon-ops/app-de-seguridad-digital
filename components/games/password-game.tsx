'use client'

import { useRef, useState } from 'react'
import { Check, Eye, EyeOff, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { checkPassword, PASSWORD_STRONG_THRESHOLD, passwordScore, WEAK_PASSWORD } from '@/lib/activities'
import { sfx } from '@/lib/sounds'
import { GameShell, SubmitBar, useSubmit } from './game-shell'

const LEVELS = [
  { label: 'Re débil', color: 'bg-destructive', text: 'text-destructive' },
  { label: 'Re débil', color: 'bg-destructive', text: 'text-destructive' },
  { label: 'Débil', color: 'bg-destructive', text: 'text-destructive' },
  { label: 'Más o menos', color: 'bg-warning', text: 'text-warning' },
  { label: 'Bien', color: 'bg-warning', text: 'text-warning' },
  { label: 'Casi blindada', color: 'bg-primary', text: 'text-primary' },
  { label: '¡Blindada!', color: 'bg-success', text: 'text-success' },
]

const CHECK_LABELS: Record<keyof ReturnType<typeof checkPassword>, string> = {
  length: '12 caracteres o más',
  upper: 'Una MAYÚSCULA',
  lower: 'Una minúscula',
  number: 'Un número',
  symbol: 'Un símbolo (! @ # $ ...)',
}

const QUICK_ADDS = ['!', '@', '#', '$', '*', '7', '9', '2025']

export function PasswordGame() {
  const [pw, setPw] = useState(WEAK_PASSWORD)
  const [show, setShow] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const wasStrong = useRef(false)
  const { submit, pending, error, result } = useSubmit('password')

  const score = passwordScore(pw)
  const checks = checkPassword(pw)
  const level = LEVELS[score]
  const strong = score >= PASSWORD_STRONG_THRESHOLD

  function update(next: string) {
    const nextStrong = passwordScore(next) >= PASSWORD_STRONG_THRESHOLD
    if (nextStrong && !wasStrong.current) sfx.success()
    wasStrong.current = nextStrong
    setPw(next.slice(0, 64))
  }

  function capitalizeFirst() {
    sfx.click()
    update(pw.replace(/[a-z]/, (c) => c.toUpperCase()))
  }

  return (
    <GameShell
      title="Fortalecedor de Contraseñas"
      instructions="Esta contraseña es re fácil de adivinar. Modificala con mayúsculas, símbolos y números hasta que la barra se ponga verde."
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="pw-input" className="text-sm font-medium text-muted-foreground">
          Tu contraseña
        </label>
        <div className={cn('flex items-center gap-2 rounded-2xl border bg-background p-2 transition-shadow', strong ? 'glow-primary border-primary' : 'border-destructive/50')}>
          <input
            ref={inputRef}
            id="pw-input"
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={(e) => update(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent px-2 py-2 font-mono text-lg outline-none md:text-xl"
          />
          <Button variant="ghost" size="icon" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => update(WEAK_PASSWORD)} aria-label="Reiniciar contraseña">
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Fuerza</span>
          <span className={cn('font-mono font-bold', level.text)} aria-live="polite">
            {level.label}
          </span>
        </div>
        <div className="flex gap-1.5" role="meter" aria-valuemin={0} aria-valuemax={6} aria-valuenow={score} aria-label="Fuerza de la contraseña">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn('h-3 flex-1 rounded-full transition-colors duration-300', i < score ? level.color : 'bg-muted')} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={capitalizeFirst}>
          Aa Mayúscula
        </Button>
        {QUICK_ADDS.map((s) => (
          <Button
            key={s}
            variant="outline"
            size="sm"
            className="font-mono"
            onClick={() => {
              sfx.click()
              update(pw + s)
              inputRef.current?.focus()
            }}
          >
            + {s}
          </Button>
        ))}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {(Object.keys(CHECK_LABELS) as (keyof typeof CHECK_LABELS)[]).map((k) => (
          <li key={k} className={cn('flex items-center gap-2 text-sm', checks[k] ? 'text-success' : 'text-muted-foreground')}>
            {checks[k] ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
            {CHECK_LABELS[k]}
          </li>
        ))}
        <li className={cn('flex items-center gap-2 text-sm', pw.length >= 16 ? 'text-success' : 'text-muted-foreground')}>
          {pw.length >= 16 ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
          Bonus: 16 caracteres o más
        </li>
      </ul>

      <SubmitBar onSubmit={() => submit({ password: pw })} pending={pending} error={error} result={result} />
    </GameShell>
  )
}
