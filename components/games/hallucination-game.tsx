'use client'

import { useState } from 'react'
import { Bot, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HALLUCINATION_ERROR_IDS, HALLUCINATION_TOKENS } from '@/lib/activities'
import { sfx } from '@/lib/sounds'
import { GameShell, SubmitBar, useSubmit } from './game-shell'

const SELECTABLE = HALLUCINATION_TOKENS.filter((t) => t.isError)

export function HallucinationGame() {
  const [found, setFound] = useState<string[]>([])
  const [corrections, setCorrections] = useState<Record<string, string>>({})
  const { submit, pending, error, result } = useSubmit('hallucination')

  function toggle(id: string) {
    setFound((f) => {
      if (f.includes(id)) {
        sfx.click()
        return f.filter((x) => x !== id)
      }
      sfx.success()
      return [...f, id]
    })
  }

  const markedTokens = SELECTABLE.filter((t) => found.includes(t.id))

  return (
    <GameShell
      title="Cazador de Alucinaciones"
      instructions={`La IA escribió esta respuesta con mucha seguridad... pero tiene datos ridículos. Tocá cada dato erróneo para marcarlo y escribí la corrección. Hay ${HALLUCINATION_ERROR_IDS.length} para cazar.`}
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/60 p-5">
        <div className="flex items-center gap-2 text-base font-semibold text-primary">
          <Bot className="size-4 text-accent" aria-hidden />
          <span className="font-mono">AsistenteIA dice:</span>
        </div>
        <p className="text-xl leading-loose md:text-2xl">
          {HALLUCINATION_TOKENS.map((t) =>
            t.isError ? (
              <button
                key={t.id}
                type="button"
                aria-pressed={found.includes(t.id)}
                onClick={() => toggle(t.id)}
                className={cn(
                  'mx-0.5 rounded-lg border-b-2 border-dashed px-1.5 font-semibold transition-all',
                  found.includes(t.id)
                    ? 'border-destructive bg-destructive/20 text-destructive line-through decoration-2'
                    : 'border-muted-foreground/40 hover:border-warning hover:bg-warning/10',
                )}
              >
                {t.text}
              </button>
            ) : (
              <span key={t.id}>{t.text}</span>
            ),
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Target className="size-4 text-primary" aria-hidden />
        <span>
          Marcaste <span className="font-mono font-bold text-primary">{found.length}</span> de {HALLUCINATION_ERROR_IDS.length}
        </span>
      </div>

      {markedTokens.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {markedTokens.map((t) => (
            <li key={t.id} className="animate-pop flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
              <label htmlFor={`fix-${t.id}`} className="text-base font-semibold">
                <span className="text-destructive line-through">{t.text}</span>
                <span className="text-muted-foreground"> → ¿qué sería lo correcto?</span>
              </label>
              <input
                id={`fix-${t.id}`}
                value={corrections[t.id] ?? ''}
                onChange={(e) => setCorrections((c) => ({ ...c, [t.id]: e.target.value.slice(0, 80) }))}
                placeholder="Escribí tu corrección"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              {result && <p className="text-base font-semibold text-success">Pista: {t.correction}</p>}
            </li>
          ))}
        </ul>
      )}

      <SubmitBar onSubmit={() => submit({ found, corrections })} pending={pending} disabled={found.length === 0} error={error} result={result} />
    </GameShell>
  )
}
