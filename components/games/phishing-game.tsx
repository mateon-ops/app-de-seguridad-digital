'use client'

import { useState } from 'react'
import { AlertTriangle, Archive, Ellipsis, Mail, MessageCircle, MessageSquareText, ShieldCheck, Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PHISHING_CASES, type Verdict } from '@/lib/activities'
import { sfx } from '@/lib/sounds'
import { GameShell, SubmitBar, useSubmit } from './game-shell'

const CHANNEL = {
  mail: { icon: Mail, label: 'Email' },
  whatsapp: { icon: MessageCircle, label: 'WhatsApp' },
  sms: { icon: MessageSquareText, label: 'SMS' },
} as const

export function PhishingGame() {
  const [answers, setAnswers] = useState<Record<string, Verdict>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<{ right: boolean; explanation: string } | null>(null)
  const { submit, pending, error, result } = useSubmit('phishing')
  const complete = Object.keys(answers).length === PHISHING_CASES.length
  const c = PHISHING_CASES[currentIndex]

  function choose(id: string, verdict: Verdict) {
    if (answers[id]) return
    const c = PHISHING_CASES.find((x) => x.id === id)!
    const right = verdict === c.answer
    if (right) sfx.success()
    else sfx.error()
    setFeedback({ right, explanation: c.explanation })
    setAnswers((a) => ({ ...a, [id]: verdict }))
    setCurrentIndex((index) => index + 1)
  }

  return (
    <GameShell title="Detective de Phishing" instructions="Leé cada mensaje con lupa. ¿Es una ESTAFA o es SEGURO? Mirá bien el remitente.">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-base font-semibold text-primary" aria-live="polite">
          <span>Mensaje {complete ? PHISHING_CASES.length : currentIndex + 1} de {PHISHING_CASES.length}</span>
          <span>{Object.keys(answers).length} resueltos</span>
        </div>
        {feedback && (
          <p className={cn('animate-pop rounded-lg p-3 text-base leading-relaxed', feedback.right ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
            <span className="font-bold">{feedback.right ? '¡Bien ahí! ' : '¡Ojo! '}</span>
            <span className="text-foreground">{feedback.explanation}</span>
          </p>
        )}
        {!complete && c && (() => {
          const chosen = answers[c.id]
          const right = chosen === c.answer
          const { icon: Icon, label } = CHANNEL[c.channel]
          return (
            <article
              key={c.id}
              className={cn(
                'flex min-h-64 flex-col overflow-hidden rounded-2xl border bg-background shadow-sm',
                !chosen && 'border-border',
                chosen && right && 'border-success/60',
                chosen && !right && 'animate-shake border-destructive/60',
              )}
            >
              {c.channel === 'mail' ? (
                <>
                  <div className="flex items-center gap-4 border-b border-border bg-muted/60 px-5 py-3 text-muted-foreground">
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <Mail className="size-5 text-primary" aria-hidden />
                      Bandeja de entrada
                    </span>
                    <span className="ml-auto flex items-center gap-4" aria-hidden="true">
                      <Archive className="size-4" />
                      <Trash2 className="size-4" />
                      <Ellipsis className="size-5" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-5 p-5 md:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-balance md:text-2xl">{c.subject}</h3>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-sm font-semibold text-primary">Recibidos</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                        {(c.senderName ?? c.from).slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-bold text-foreground">{c.senderName ?? c.from}</span>
                          <span className="break-all text-base text-muted-foreground">&lt;{c.from}&gt;</span>
                          <span className="ml-auto text-base text-muted-foreground">10:42</span>
                        </div>
                        <p className="flex items-center gap-1 text-base text-muted-foreground">
                          para mí <span aria-hidden="true">⌄</span>
                        </p>
                      </div>
                      <Star className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <p className="max-w-3xl whitespace-pre-line text-lg leading-7 text-foreground">{c.body}</p>
                    <div className="mt-auto flex items-center gap-2 border-t border-border pt-4 text-base text-muted-foreground">
                      <Icon className="size-4" aria-hidden />
                      <span>{label}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col gap-4 p-5 md:p-8">
                  <header className="flex flex-wrap items-center gap-2 text-base text-muted-foreground">
                    <Icon className="size-5" aria-hidden />
                    <span>{label}</span>
                    <span className="ml-auto break-all text-base" title={c.from}>{c.from}</span>
                  </header>
                  <h3 className="text-xl font-bold text-balance md:text-2xl">{c.subject}</h3>
                  <p className="text-lg leading-relaxed text-foreground">{c.body}</p>
                </div>
              )}
              <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border bg-muted/30 p-4 md:px-8">
                <button
                  type="button"
                  aria-pressed={chosen === 'scam'}
                  onClick={() => choose(c.id, 'scam')}
                  disabled={Boolean(chosen)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-base font-bold transition-colors disabled:cursor-default',
                    chosen === 'scam' ? 'border-destructive bg-destructive text-white' : 'border-destructive/40 text-destructive hover:bg-destructive/10',
                  )}
                >
                  <AlertTriangle className="size-4" aria-hidden />
                  ESTAFA
                </button>
                <button
                  type="button"
                  aria-pressed={chosen === 'safe'}
                  onClick={() => choose(c.id, 'safe')}
                  disabled={Boolean(chosen)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-base font-bold transition-colors disabled:cursor-default',
                    chosen === 'safe' ? 'border-success bg-success text-primary-foreground' : 'border-success/40 text-success hover:bg-success/10',
                  )}
                >
                  <ShieldCheck className="size-4" aria-hidden />
                  SEGURO
                </button>
              </div>
            </article>
          )
        })()}
      </div>
      <SubmitBar onSubmit={() => submit({ answers })} pending={pending} disabled={!complete} error={error} result={result} />
    </GameShell>
  )
}
