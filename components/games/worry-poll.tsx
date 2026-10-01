'use client'

import { useState } from 'react'
import { AtSign as Instagram, Camera, PiggyBank, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WORRY_OPTIONS } from '@/lib/activities'
import { sfx } from '@/lib/sounds'
import { GameShell, SubmitBar, useSubmit } from './game-shell'

const ICONS = { social: Instagram, money: PiggyBank, photos: Camera, clients: Users } as const

export function WorryPoll() {
  const [choice, setChoice] = useState<string | null>(null)
  const { submit, pending, error, result } = useSubmit('worry')

  return (
    <GameShell title="¿Qué es lo que más te preocuparía que te roben?" instructions="Elegí una opción. Tu voto cuenta para el resultado de la clase.">
      <div role="radiogroup" aria-label="Opciones" className="grid gap-3 sm:grid-cols-2">
        {WORRY_OPTIONS.map((o) => {
          const Icon = ICONS[o.id]
          const active = choice === o.id
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                sfx.click()
                setChoice(o.id)
              }}
              className={cn(
                'flex items-center gap-4 rounded-2xl border p-5 text-left text-lg font-semibold transition-all',
                active ? 'scale-[1.02] border-primary bg-primary/15 glow-primary' : 'border-border bg-card hover:border-primary/50',
              )}
            >
              <Icon className={cn('size-7', active ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
              {o.label}
            </button>
          )
        })}
      </div>
      <SubmitBar onSubmit={() => submit({ choice })} pending={pending} disabled={!choice} error={error} result={result} label="Votar" />
    </GameShell>
  )
}
