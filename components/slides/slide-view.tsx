'use client'

import { useState } from 'react'
import {
  Bot,
  Briefcase,
  CheckCircle2,
  Circle,
  Fish,
  KeyRound,
  Lock,
  MessageCircleQuestion,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  UserX,
  Wallet,
  Bell,
  Link2Off,
  Split,
  Lightbulb,
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GOLDEN_RULES, SLIDES } from '@/lib/slides'

function Tile({
  icon: Icon,
  title,
  text,
  tone = 'primary',
}: {
  icon: React.ElementType
  title: string
  text: string
  tone?: 'primary' | 'accent' | 'warning' | 'destructive'
}) {
  const toneClass = {
    primary: 'text-primary bg-primary/10 border-primary/30',
    accent: 'text-accent bg-accent/10 border-accent/30',
    warning: 'text-warning bg-warning/10 border-warning/30',
    destructive: 'text-destructive bg-destructive/10 border-destructive/30',
  }[tone]
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-5 transition-transform hover:-translate-y-1">
      <span className={cn('flex size-11 items-center justify-center rounded-xl border', toneClass)}>
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="text-lg font-semibold text-balance">{title}</h3>
      <p className="text-base leading-relaxed text-muted-foreground text-pretty">{text}</p>
    </div>
  )
}

function GoldenRules() {
  const [checked, setChecked] = useState<boolean[]>(() => GOLDEN_RULES.map(() => false))
  const done = checked.filter(Boolean).length
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(done / GOLDEN_RULES.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-base text-muted-foreground">
          {done}/{GOLDEN_RULES.length}
        </span>
      </div>
      <ul className="grid gap-2 md:grid-cols-2">
        {GOLDEN_RULES.map((rule, i) => (
          <li key={rule}>
            <button
              type="button"
              aria-pressed={checked[i]}
              onClick={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                checked[i] ? 'border-primary/50 bg-primary/10' : 'border-border bg-card/60 hover:bg-card',
              )}
            >
              {checked[i] ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              ) : (
                <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              )}
                <span className="text-base leading-relaxed">
                <span className="mr-1 font-mono text-primary">{i + 1}.</span>
                {rule}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {done === GOLDEN_RULES.length && (
        <p className="animate-pop rounded-xl border border-success/40 bg-success/10 p-3 text-center font-semibold text-success">
          ¡Perfecto!
        </p>
      )}
    </div>
  )
}

function SlideBody({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <span className="flex size-20 animate-float items-center justify-center rounded-3xl border border-primary/40 bg-primary/10 text-primary glow-primary">
            <ShieldCheck className="size-10" aria-hidden />
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-balance md:text-6xl">
            Seguridad Digital y <span className="text-primary">Uso Responsable de la IA</span>
          </h2>
          <p className="rounded-full border border-accent/40 bg-accent px-4 py-1.5 font-mono text-base text-white font-bold">
            Emprendimientos Seguros
          </p>
          <p className="max-w-xl text-muted-foreground text-pretty">
            Hoy vas a aprender a proteger tu negocio como un crack!: cuentas blindadas por contraseñas, IA bien usada y el dinero a salvo.
          </p>
        </div>
      )
    case 1:
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <Tile icon={Lock} title="Blindar cuentas" text="Contraseñas fuertes y 2FA para que nadie entre a tus redes ni a tu tienda." />
          <Tile icon={Bot} tone="accent" title="Usar IA con cabeza propia" text="La IA ayuda un montón, pero vos tenés la última palabra. Siempre chequeá." />
          <Tile icon={Wallet} tone="warning" title="Cuidar el dinero del negocio" text="Separar cuentas, activar alertas y no compartir claves con nadie." />
        </div>
      )
    case 2:
      return (
        <div className="flex flex-col gap-5">
          <ol className="grid gap-3 md:grid-cols-3">
            {['Creamos nuestro emprendimiento', 'Armamos redes y catálogo', 'Empezamos a vender online'].map((step, i) => (
              <li key={step} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-base font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-base">{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-6 text-center">
            <MessageCircleQuestion className="size-8 text-warning" aria-hidden />
            <p className="text-2xl font-bold text-balance md:text-3xl">
              {'¿Qué es lo que más te preocuparía que te roben?'}
            </p>
          </div>
        </div>
      )
    case 3:
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <Tile icon={KeyRound} title="Contraseñas fuertes" text="Largas (12+), con mayúsculas, minúsculas, números y símbolos. Una distinta para cada cuenta." />
          <Tile icon={Smartphone} tone="accent" title="2FA" text="Doble factor: además de la clave, un código en tu celu. Aunque roben tu clave, no entran." />
          <Tile icon={Lock} tone="warning" title="HTTPS y candado" text="Antes de poner datos, fijate que la web empiece con https:// y tenga el candadito." />
        </div>
      )
    case 4:
      return (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="size-5" aria-hidden />
                <h3 className="font-semibold text-foreground">Cuenta personal</h3>
              </div>
              <p className="text-base text-muted-foreground">Si te la roban: perdés fotos, chats y tu privacidad.</p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
              <div className="flex items-center gap-2 text-destructive">
                <Store className="size-5" aria-hidden />
                <h3 className="font-semibold text-foreground">Cuenta comercial</h3>
              </div>
              <p className="text-base text-muted-foreground">
                Si te la roban: pueden estafar a tus clientes en tu nombre, quedarse con tus ventas y arruinar tu reputación.
              </p>
            </div>
          </div>
          <p className="flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 p-4 text-center font-semibold text-primary">
            <Briefcase className="size-5 shrink-0" aria-hidden />
            Con un negocio, el 2FA protege tu plata y la confianza de tus clientes.
          </p>
        </div>
      )
    case 5:
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <Tile icon={Fish} tone="destructive" title="Mails truchos" text="Parecen de Google o Mercado Pago, pero el remitente es raro. Siempre mirá el dominio." />
          <Tile icon={Briefcase} tone="warning" title="Falsos mayoristas" text="Precios increíbles y te piden pagar todo por adelantado. Si es demasiado bueno, desconfiá." />
          <Tile icon={UserX} tone="destructive" title="Perfiles duplicados" text="Copian tu tienda con un nombre casi igual para engañar a tus clientes." />
        </div>
      )
    case 6:
      return (
        <div className="flex flex-col gap-4">
          <p className="text-center text-muted-foreground text-pretty">
            La IA a veces <span className="font-semibold text-destructive">alucina</span>: inventa datos con total seguridad. Usá la regla de los 3 pasos:
          </p>
          <ol className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Search, title: '1. Revisar', text: 'Leé con atención. ¿Los números tienen sentido?' },
              { icon: RefreshCw, title: '2. Repreguntar', text: 'Pedile que te explique o que lo verifique de otra forma.' },
              { icon: Lightbulb, title: '3. Entender el porqué', text: 'Si no entendés la respuesta, no la uses todavía.' },
            ].map((s) => (
              <li key={s.title}>
                <Tile icon={s.icon} tone="accent" title={s.title} text={s.text} />
              </li>
            ))}
          </ol>
        </div>
      )
    case 7:
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Tile icon={Split} title="Separar cuentas" text="Una cuenta para lo personal y otra para el emprendimiento." />
          <Tile icon={Bell} tone="accent" title="Activar alertas" text="Que te avise cada vez que entra o sale plata." />
          <Tile icon={KeyRound} tone="warning" title="No compartir claves" text="Ni con amigos, ni con la familia. Las claves son solo tuyas." />
          <Tile icon={Link2Off} tone="destructive" title="Desconfiar de links de cobro" text="Si te llega un link para cobrar por SMS o mail, no lo toques." />
        </div>
      )
    case 8:
      return <GoldenRules />
    case 9:
      return (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-accent">
            <Sparkles className="size-8" aria-hidden />
          </span>
          <p className="max-w-2xl text-2xl font-semibold text-balance md:text-3xl">
            Ya aprendiste las claves de la seguridad digital{' '}
            <span className="text-primary">¿en donde las vas a aplicar primero?</span>
          </p>
          <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
            {['¿Qué cambio hacés hoy?', '¿A quién le vas a contar?', '¿Qué contraseña vas a mejorar?'].map((q) => (
              <p key={q} className="rounded-xl border border-border bg-card/60 p-4 text-base">
                {q}
              </p>
            ))}
          </div>
          <p className="font-mono text-base text-muted-foreground">¡Gracias por participar!</p>
        </div>
      )
    default:
      return null
  }
}

export function SlideView({ index, compact = false }: { index: number; compact?: boolean }) {
  const slide = SLIDES[index]
  if (!slide) return null
  return (
    <article
      key={index}
      className={cn(
        'animate-pop relative flex min-h-0 flex-1 flex-col justify-center gap-6 overflow-y-auto bg-card/70 bg-grid',
        compact ? 'p-5' : 'px-5 py-6 md:px-12 md:py-10',
      )}
      aria-labelledby={`slide-title-${index}`}
    >
      <header className="flex items-center justify-between gap-4">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-sm text-primary">
          Diapositiva {slide.number}/{SLIDES.length}
        </span>
        {slide.activity && (
          <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-sm text-accent">
            Actividad
          </span>
        )}
      </header>
      {index !== 0 && (
        <h2 id={`slide-title-${index}`} className="text-2xl font-bold tracking-tight text-balance md:text-4xl">
          {slide.title}
        </h2>
      )}
      {index === 0 && <h2 id={`slide-title-${index}`} className="sr-only">{slide.title}</h2>}
      <SlideBody index={index} />
    </article>
  )
}
