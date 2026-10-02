'use client'

import { useState } from 'react'
import { Bot, Check, Lock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AI_DATA_CASES } from '@/lib/activities'
import { GameShell, SubmitBar, useSubmit } from './game-shell'

type Classification = Record<string, boolean>

export function AiDataClassifier() {
  const [classification, setClassification] = useState<Classification>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { submit, pending, error, result } = useSubmit('ai-data')

  const complete = Object.keys(classification).length === AI_DATA_CASES.length
  const remaining = AI_DATA_CASES.filter((item) => !(item.id in classification))

  function assign(id: string, shareable: boolean) {
    setClassification((current) => ({ ...current, [id]: shareable }))
    setSelectedId(null)
  }

  function handleDrop(event: React.DragEvent<HTMLButtonElement>, shareable: boolean) {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain')
    if (AI_DATA_CASES.some((item) => item.id === id)) assign(id, shareable)
  }

  return (
    <GameShell
      title="¿Qué datos compartir con la IA?"
      instructions="Arrastrá cada ejemplo a su categoría. También podés tocar una tarjeta y después la categoría."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { shareable: false, title: 'No compartir con la IA', icon: Lock, tone: 'destructive' },
          { shareable: true, title: 'Sí se puede compartir', icon: Bot, tone: 'success' },
        ].map(({ shareable, title, icon: Icon, tone }) => {
          const items = AI_DATA_CASES.filter((item) => classification[item.id] === shareable)
          return (
            <section key={title} className="flex min-h-48 flex-col gap-3 rounded-xl border border-border bg-background/60 p-4" aria-label={title}>
              <button
                type="button"
                onClick={() => selectedId && assign(selectedId, shareable)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, shareable)}
                className={cn(
                  'flex min-h-20 items-center gap-3 rounded-lg border-2 border-dashed p-4 text-left transition-colors',
                  tone === 'destructive'
                    ? 'border-destructive/40 bg-destructive/5 hover:bg-destructive/10'
                    : 'border-success/40 bg-success/5 hover:bg-success/10',
                  selectedId && 'ring-2 ring-primary/40',
                )}
                aria-label={`${title}. Soltá una tarjeta acá o tocá para asignar la tarjeta seleccionada`}
              >
                <Icon className={cn('size-6 shrink-0', tone === 'destructive' ? 'text-destructive' : 'text-success')} aria-hidden />
                <span className="text-lg font-bold">{title}</span>
              </button>
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData('text/plain', item.id)}
                      onClick={() => setSelectedId(item.id)}
                      aria-pressed={selectedId === item.id}
                      className={cn(
                        'flex w-full cursor-grab items-center gap-2 rounded-lg border p-3 text-left active:cursor-grabbing',
                        'border-border bg-card hover:border-primary/50',
                        complete && (item.shareable === shareable ? 'border-success/50' : 'border-destructive/50'),
                        selectedId === item.id && 'ring-2 ring-primary',
                      )}
                    >
                      {complete && (item.shareable === shareable) && <Check className="size-4 shrink-0 text-success" aria-hidden />}
                      <span className="text-lg">{item.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      {remaining.length > 0 && (
        <section aria-label="Ejemplos por clasificar" className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-primary">Por clasificar ({remaining.length})</h3>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {remaining.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData('text/plain', item.id)}
                  onClick={() => setSelectedId(item.id)}
                  aria-pressed={selectedId === item.id}
                  className={cn(
                    'flex min-h-12 w-full cursor-grab items-center rounded-lg border border-border bg-card p-3 text-left text-lg hover:border-primary/50 active:cursor-grabbing',
                    selectedId === item.id && 'ring-2 ring-primary',
                  )}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p aria-live="polite" className="text-center text-base font-semibold text-primary">
        {complete ? '¡Ya clasificaste los seis ejemplos!' : `${Object.keys(classification).length} de ${AI_DATA_CASES.length} clasificados`}
      </p>

      {complete && (
        <div className="animate-pop flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-accent/40 bg-accent/10 p-6 text-center">
          <Sparkles className="size-8 text-accent" aria-hidden />
          <p className="text-3xl font-bold text-balance md:text-5xl">¿Que otros datos se te ocurren?</p>
        </div>
      )}

      <SubmitBar
        onSubmit={() => submit({ answers: classification })}
        pending={pending}
        disabled={!complete}
        error={error}
        result={result}
        label="Enviar clasificación"
      />
    </GameShell>
  )
}