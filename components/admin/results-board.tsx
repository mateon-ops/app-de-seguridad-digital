'use client'

import { RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ACTIVITY_LABELS,
  AI_DATA_CASES,
  HALLUCINATION_TOKENS,
  PHISHING_CASES,
  TRAFFIC_CASES,
  WORRY_OPTIONS,
  type ActivityId,
} from '@/lib/activities'
import { SLIDES } from '@/lib/slides'

export type DashboardResponse = {
  room: { code: string; currentSlide: number; mode: 'presentation' | 'game' }
  participants: { id: string; nickname: string; online: boolean }[]
  onlineCount: number
  responses: {
    participantId: string
    nickname: string
    activity: string
    correct: number
    total: number
    payload: Record<string, unknown>
  }[]
}

function Bar({ label, value, max, tone = 'bg-primary' }: { label: string; value: number; max: number; tone?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between gap-2 text-xs">
        <span className="truncate">{label}</span>
        <span className="font-mono text-muted-foreground">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all duration-500', tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ItemBreakdown({ activity, rows }: { activity: ActivityId; rows: DashboardResponse['responses'] }) {
  const n = rows.length
  if (activity === 'worry') {
    return (
      <div className="flex flex-col gap-3">
        {WORRY_OPTIONS.map((o) => (
          <Bar key={o.id} label={o.label} value={rows.filter((r) => r.payload.choice === o.id).length} max={n} />
        ))}
      </div>
    )
  }
  if (activity === 'phishing' || activity === 'traffic') {
    const cases = activity === 'phishing'
      ? PHISHING_CASES.map((c) => ({ id: c.id, label: c.subject, answer: c.answer as string, acceptableAnswers: [] as string[] }))
      : TRAFFIC_CASES.map((c) => ({ id: c.id, label: c.text, answer: c.answer as string, acceptableAnswers: c.acceptableAnswers ?? [] }))
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Aciertos por caso</p>
        {cases.map((c) => (
          <Bar
            key={c.id}
            label={c.label}
            value={rows.filter((r) => {
              const answer = (r.payload.answers as Record<string, string> | undefined)?.[c.id]
              return answer === c.answer || c.acceptableAnswers.includes(answer ?? '')
            }).length}
            max={n}
            tone="bg-success"
          />
        ))}
      </div>
    )
  }
  if (activity === 'hallucination') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Errores detectados</p>
        {HALLUCINATION_TOKENS.filter((t) => t.isError).map((t) => (
          <Bar key={t.id} label={t.text} value={rows.filter((r) => (r.payload.found as string[] | undefined)?.includes(t.id)).length} max={n} tone="bg-success" />
        ))}
      </div>
    )
  }
  if (activity === 'ai-data') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Clasificaciones correctas por ejemplo</p>
        {AI_DATA_CASES.map((item) => (
          <Bar
            key={item.id}
            label={item.text}
            value={rows.filter((r) => (r.payload.answers as Record<string, boolean> | undefined)?.[item.id] === item.shareable).length}
            max={n}
            tone="bg-success"
          />
        ))}
      </div>
    )
  }
  const strong = rows.filter((r) => r.correct === 1).length
  return (
    <div className="flex flex-col gap-3">
      <Bar label="Contraseña blindada" value={strong} max={n} tone="bg-success" />
      <Bar label="Todavía débil" value={n - strong} max={n} tone="bg-destructive" />
    </div>
  )
}

export function ResultsBoard({ data, onReset }: { data: DashboardResponse; onReset: (activity: string) => void }) {
  const slide = SLIDES[data.room.currentSlide]
  const activity = slide.activity
  const rows = activity ? data.responses.filter((r) => r.activity === activity) : []

  const leaderboard = Object.values(
    data.responses.reduce<Record<string, { nickname: string; points: number }>>((acc, r) => {
      acc[r.participantId] ??= { nickname: r.nickname, points: 0 }
      acc[r.participantId].points += r.correct
      return acc
    }, {}),
  )
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)

  const answeredIds = new Set(rows.map((r) => r.participantId))

  return (
    <aside className="flex flex-col gap-4" aria-label="Resultados en tiempo real">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">{activity ? ACTIVITY_LABELS[activity] : 'Resultados en vivo'}</h2>
            <p className="text-xs text-muted-foreground">
              {activity ? `${rows.length} de ${data.participants.length} respondieron` : 'Elegí una diapositiva con juego.'}
            </p>
          </div>
          {activity && rows.length > 0 && (
            <Button variant="ghost" size="icon-sm" onClick={() => onReset(activity)} aria-label="Reiniciar respuestas">
              <RotateCcw className="size-4" />
            </Button>
          )}
        </header>
        {activity && (rows.length ? <ItemBreakdown activity={activity} rows={rows} /> : <p className="text-sm text-muted-foreground">Esperando respuestas...</p>)}
      </section>

      {activity && rows.length > 0 && activity !== 'worry' && (
        <section className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Respuestas individuales</h2>
          <ul className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
            {rows.map((r) => (
              <li key={r.participantId} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{r.nickname}</span>
                <span className={cn('font-mono text-xs', r.correct === r.total ? 'text-success' : 'text-warning')}>
                  {r.correct}/{r.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Trophy className="size-4 text-warning" aria-hidden />
          Ranking general
        </h2>
        {leaderboard.length ? (
          <ol className="flex flex-col gap-1.5">
            {leaderboard.map((p, i) => (
              <li key={`${p.nickname}-${i}`} className="flex items-center gap-2 text-sm">
                <span className="w-5 font-mono text-muted-foreground">{i + 1}</span>
                <span className="flex-1 truncate">{p.nickname}</span>
                <span className="font-mono text-primary">{p.points} pts</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">Todavía no hay puntos.</p>
        )}
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Estudiantes ({data.participants.length})</h2>
        <ul className="flex flex-wrap gap-1.5">
          {data.participants.map((p) => (
            <li
              key={p.id}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs',
                answeredIds.has(p.id) ? 'border-success/50 bg-success/10' : 'border-border',
                !p.online && 'opacity-40',
              )}
            >
              <span className={cn('size-1.5 rounded-full', p.online ? 'bg-success' : 'bg-muted-foreground')} aria-hidden />
              {p.nickname}
              <span className="sr-only">{p.online ? '(en línea)' : '(desconectado)'}</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
