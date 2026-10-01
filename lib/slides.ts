import type { ActivityId } from './activities'

export type Slide = {
  number: number
  short: string
  title: string
  activity?: ActivityId
}

export const SLIDES: Slide[] = [
  { number: 1, short: 'Inicio', title: 'Seguridad Digital y Uso Responsable de la IA' },
  { number: 2, short: 'Los 3 pilares', title: 'Los 3 pilares de un emprendimiento seguro' },
  { number: 3, short: 'Repaso', title: 'Repaso del curso', activity: 'worry' },
  { number: 4, short: 'Conceptos básicos', title: 'Conceptos básicos', activity: 'password' },
  { number: 5, short: '2FA x2', title: 'Por qué el 2FA importa el doble' },
  { number: 6, short: 'Phishing 2.0', title: 'Phishing 2.0 y estafas avanzadas', activity: 'phishing' },
  { number: 7, short: 'IA crítica', title: 'Uso crítico de la IA', activity: 'hallucination' },
  { number: 8, short: 'Cuentas de dinero', title: 'Cuidados al vincular cuentas de dinero', activity: 'traffic' },
  { number: 9, short: '7 reglas de oro', title: 'Las 7 reglas de oro' },
  { number: 10, short: 'Datos e IA', title: '¿Qué datos compartir con la IA?', activity: 'ai-data' },
  { number: 11, short: 'Cierre', title: 'Cierre y reflexión final' },
]

export const GOLDEN_RULES = [
  'Uso contraseñas largas y distintas para cada cuenta.',
  'Activo el 2FA en todas mis cuentas, sobre todo las del negocio.',
  'Reviso el remitente y el link antes de hacer clic.',
  'Nunca comparto claves ni códigos, ni con mi familia.',
  'Chequeo lo que me dice la IA antes de usarlo.',
  'Separo la cuenta personal de la del emprendimiento.',
  'Activo alertas de movimientos en mis cuentas de dinero.',
]

export function clampSlide(index: number) {
  return Math.max(0, Math.min(SLIDES.length - 1, Math.trunc(index)))
}
