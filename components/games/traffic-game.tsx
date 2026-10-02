'use client'

import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TRAFFIC_CASES, type Light } from '@/lib/activities'
import { sfx } from '@/lib/sounds'
import { GameShell, SubmitBar, useSubmit } from './game-shell'

const LIGHTS: { id: Light; label: string; hint: string; dot: string; zone: string; active: string }[] = [
  { id: 'green', label: 'Verde', hint: 'Seguro', dot: 'bg-success', zone: 'border-success/60 bg-success/10', active: 'ring-success/35' },
  { id: 'yellow', label: 'Amarillo', hint: 'Con cuidado', dot: 'bg-warning', zone: 'border-warning/60 bg-warning/10', active: 'ring-warning/35' },
  { id: 'red', label: 'Rojo', hint: 'Peligro', dot: 'bg-destructive', zone: 'border-destructive/60 bg-destructive/10', active: 'ring-destructive/35' },
]

export function TrafficGame() {
  const [answers, setAnswers] = useState<Record<string, Light>>({})
  const [over, setOver] = useState<Light | null>(null)
  const { submit, pending, error, result } = useSubmit('traffic')

  function place(id: string, light: Light) {
    sfx.click()
    setAnswers((a) => ({ ...a, [id]: light }))
  }

  const pending_ = TRAFFIC_CASES.filter((c) => !answers[c.id])
  const complete = pending_.length === 0

  function Card({ id }: { id: string }) {
    const c = TRAFFIC_CASES.find((x) => x.id === id)!
    const chosen = answers[id]
    const showResult = Boolean(result && chosen)
    const right = chosen === c.answer || Boolean(chosen && c.acceptableAnswers?.includes(chosen))
    return (
      <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', id)}
        className={cn(
          'flex cursor-grab flex-col gap-2 rounded-xl border bg-card p-3 active:cursor-grabbing',
          showResult ? (right ? 'border-success' : 'animate-shake border-destructive') : 'border-border',
        )}
      >
        <div className="flex items-start gap-2">
          <GripVertical className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <p className="text-base font-medium">{c.text}</p>
        </div>
        {showResult && <p className={cn('text-base font-medium', right ? 'text-success' : 'text-destructive')}>{c.explanation}</p>}
      </div>
    )
  }

  return (
    <GameShell title="Semáforo Financiero" instructions="Arrastrá cada situación al color que corresponde. Verde = seguro, Amarillo = con cuidado, Rojo = peligro.">
      {pending_.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {pending_.map((c) => (
            <Card key={c.id} id={c.id} />
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {LIGHTS.map((l) => (
          <div
            key={l.id}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(l.id)
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              e.preventDefault()
              setOver(null)
              const id = e.dataTransfer.getData('text/plain')
              if (TRAFFIC_CASES.some((c) => c.id === id)) place(id, l.id)
            }}
            className={cn(
              'flex min-h-44 flex-col gap-3 rounded-2xl border-2 border-dashed p-4 transition-all md:min-h-56',
              l.zone,
              over === l.id && cn('scale-[1.02] border-solid ring-4 ring-offset-2 shadow-md', l.active),
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn('size-4 rounded-full shadow-[0_0_12px_currentColor]', l.dot)} aria-hidden />
              <span className="text-lg font-bold">{l.label}</span>
              <span className="text-base font-medium text-muted-foreground">{l.hint}</span>
            </div>
            {TRAFFIC_CASES.filter((c) => answers[c.id] === l.id).map((c) => (
              <Card key={c.id} id={c.id} />
            ))}
          </div>
        ))}
      </div>

      <SubmitBar onSubmit={() => submit({ answers })} pending={pending} disabled={!complete} error={error} result={result} />
    </GameShell>
  )
}
