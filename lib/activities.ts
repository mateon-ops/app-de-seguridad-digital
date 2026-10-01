export type ActivityId = 'worry' | 'password' | 'phishing' | 'hallucination' | 'traffic' | 'ai-data'

export const ACTIVITY_LABELS: Record<ActivityId, string> = {
  worry: 'Pregunta disparadora',
  password: 'Fortalecedor de Contraseñas',
  phishing: 'Detective de Phishing',
  hallucination: 'Cazador de Alucinaciones',
  traffic: 'Semáforo Financiero',
  'ai-data': 'Clasificador de datos para IA',
}

export const WORRY_OPTIONS = [
  { id: 'social', label: 'Mis redes sociales' },
  { id: 'money', label: 'La plata del negocio' },
  { id: 'photos', label: 'Fotos y datos personales' },
  { id: 'clients', label: 'Mis clientes y ventas' },
] as const

export const WEAK_PASSWORD = 'volandoaltobudines123'

export type PasswordChecks = {
  length: boolean
  upper: boolean
  lower: boolean
  number: boolean
  symbol: boolean
}

export function checkPassword(pw: string): PasswordChecks {
  return {
    length: pw.length >= 12,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  }
}

export function passwordScore(pw: string) {
  const checks = checkPassword(pw)
  let score = Object.values(checks).filter(Boolean).length
  if (pw.length >= 16) score += 1
  if (pw.toLowerCase() === WEAK_PASSWORD) score = Math.min(score, 2)
  return Math.min(score, 6)
}

export const PASSWORD_STRONG_THRESHOLD = 6

export type Verdict = 'scam' | 'safe'

export const PHISHING_CASES: {
  id: string
  channel: 'mail' | 'whatsapp' | 'sms'
  from: string
  senderName?: string
  subject: string
  body: string
  answer: Verdict
  explanation: string
}[] = [
  {
    id: 'google',
    channel: 'mail',
    from: 'no-reply@host3d.net',
    senderName: 'Google',
    subject: 'Google: nuevo inicio de sesión en Brasil',
    body: 'Detectamos un acceso a tu cuenta desde São Paulo. Si no fuiste vos, ingresá acá para bloquear tu cuenta.',
    answer: 'scam',
    explanation: 'El remitente no es google.com. Google nunca te escribe desde un dominio raro como host3d.net.',
  },
  {
    id: 'mercadopago',
    channel: 'mail',
    from: 'smtp-171ni@medpalpk.com',
    senderName: 'Mercado Pago',
    subject: 'Mercado Pago: tu cuenta fue SUSPENDIDA',
    body: 'Para reactivarla, respondé este correo con tu usuario, contraseña y el código que te llegue por SMS.',
    answer: 'scam',
    explanation: 'Correo extraño exigiendo tus datos y tu código. Ninguna empresa real te pide la contraseña.',
  },
  {
    id: 'abril',
    channel: 'whatsapp',
    from: 'Abril (clienta habitual)',
    subject: 'Pedido',
    body: '¡Hola! ¿Me hacés un budín de naranja para el sábado? Te lo paso a buscar como siempre.',
    answer: 'safe',
    explanation: 'Es una clienta conocida, no pide datos ni plata por adelantado y no hay links. Todo normal.',
  },
  {
    id: 'premio',
    channel: 'sms',
    from: '+54 9 11 0000-0000',
    subject: '¡Ganaste un premio sorpresa!',
    body: 'Felicitaciones, fuiste elegido. Reclamá tu premio en las próximas 2 horas: bit.ly/premio-ya',
    answer: 'scam',
    explanation: 'Premio que nunca jugaste + urgencia + link acortado = estafa clásica.',
  },
]

export const HALLUCINATION_TOKENS: { id: string; text: string; isError: boolean; correction?: string }[] = [
  { id: 't1', text: 'Para hacer 12 budines necesitás ', isError: false },
  { id: 'flour', text: '10 kg de harina', isError: true, correction: 'Unos 3 kg de harina (≈250 g por budín)' },
  { id: 't2', text: ', ', isError: false },
  { id: 'eggs', text: '40 huevos', isError: true, correction: 'Entre 24 y 36 huevos (2 o 3 por budín)' },
  { id: 't3', text: ', hornear ', isError: false },
  { id: 'time', text: '2 horas', isError: true, correction: 'Entre 40 y 50 minutos' },
  { id: 't4', text: ' a ', isError: false },
  { id: 'temp', text: '30 °C', isError: true, correction: 'Unos 180 °C' },
  { id: 't5', text: ' y cuesta ', isError: false },
  { id: 'price', text: '$500', isError: true, correction: 'Mucho más: hay que calcular ingredientes reales' },
  { id: 't6', text: '.', isError: false },
]

export const HALLUCINATION_ERROR_IDS = HALLUCINATION_TOKENS.filter((t) => t.isError).map((t) => t.id)

export type Light = 'green' | 'yellow' | 'red'

export const TRAFFIC_CASES: { id: string; text: string; answer: Light; acceptableAnswers?: Light[]; explanation: string }[] = [
  {
    id: 'cbu',
    text: 'Pasar CBU/Alias a un cliente por WhatsApp',
    answer: 'green',
    explanation: 'El CBU/Alias sirve para recibir plata. Compartirlo con un cliente es seguro.',
  },
  {
    id: 'password',
    text: 'Darle la contraseña de Mercado Pago a un familiar',
    answer: 'red',
    explanation: 'Las claves no se comparten con nadie, ni con la familia. Si necesitan ayudarte, que usen su propia cuenta.',
  },
  {
    id: 'alerts',
    text: 'Activar notificaciones de transferencias recibidas',
    answer: 'green',
    explanation: 'Las alertas te avisan al instante si pasa algo raro. ¡Siempre activadas!',
  },
  {
    id: 'sms',
    text: "Hacer clic en un link de 'Cobro Rápido' recibido por SMS",
    answer: 'red',
    explanation: 'Los links de cobro por SMS son una trampa típica para robarte los datos.',
  },
  {
    id: 'street-qr',
    text: 'Escanear código QR de la calle',
    answer: 'yellow',
    acceptableAnswers: ['red'],
    explanation: 'Un QR pegado en la calle puede estar alterado o llevar a un sitio falso. Verificá su origen antes de escanearlo.',
  },
  {
    id: 'customer-qr',
    text: 'Realizar un código QR y compartirlos con tus clientes',
    answer: 'green',
    explanation: 'Un QR creado por tu emprendimiento para que tus clientes te paguen es seguro. Revisá que dirija a tu cuenta.',
  },
]

export const AI_DATA_CASES: { id: string; text: string; shareable: boolean }[] = [
  { id: 'dni', text: 'Número de DNI', shareable: false },
  { id: 'cbu', text: 'CBU o alias de tu cuenta', shareable: false },
  { id: 'tax-key', text: 'Clave Fiscal o contraseña', shareable: false },
  { id: 'address', text: 'Domicilio particular', shareable: false },
  { id: 'business-name', text: 'Nombre de tu emprendimiento', shareable: true },
  { id: 'idea-consultation', text: 'Consulta para mejorar una idea', shareable: true },
]

export function sanitizeText(value: unknown, max = 120) {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max)
}

export type Graded = { correct: number; total: number; payload: Record<string, unknown> }

export function gradeActivity(activity: ActivityId, input: unknown): Graded | null {
  const data = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>

  switch (activity) {
    case 'worry': {
      const choice = WORRY_OPTIONS.find((o) => o.id === data.choice)
      if (!choice) return null
      return { correct: 0, total: 0, payload: { choice: choice.id } }
    }
    case 'password': {
      const pw = typeof data.password === 'string' ? data.password.slice(0, 64) : ''
      const score = passwordScore(pw)
      return {
        correct: score >= PASSWORD_STRONG_THRESHOLD ? 1 : 0,
        total: 1,
        payload: { score, length: pw.length, checks: checkPassword(pw) },
      }
    }
    case 'phishing': {
      const answers = (data.answers ?? {}) as Record<string, unknown>
      const clean: Record<string, Verdict> = {}
      let correct = 0
      for (const c of PHISHING_CASES) {
        const v = answers[c.id]
        if (v === 'scam' || v === 'safe') {
          clean[c.id] = v
          if (v === c.answer || c.acceptableAnswers?.includes(v)) correct++
        }
      }
      return { correct, total: PHISHING_CASES.length, payload: { answers: clean } }
    }
    case 'hallucination': {
      const found = Array.isArray(data.found) ? data.found.filter((x): x is string => typeof x === 'string') : []
      const corrections = (data.corrections ?? {}) as Record<string, unknown>
      const validFound = [...new Set(found)].filter((id) => {
        if (!HALLUCINATION_TOKENS.some((t) => t.id === id)) return false
        if (id !== 'price') return true

        const correction = sanitizeText(corrections[id], 80).toLowerCase()
        const amounts = correction.matchAll(/(\d[\d.,]*)\s*(mil(?:es)?|mill[oó]n(?:es)?)?/g)
        for (const [, amount, unit] of amounts) {
          const value = Number(amount.replace(/\D/g, ''))
          const multiplier = unit?.startsWith('mill') ? 1_000_000 : unit ? 1_000 : 1
          if (value * multiplier > 150_000) return false
        }
        return true
      })
      const cleanCorrections: Record<string, string> = {}
      for (const id of validFound) cleanCorrections[id] = sanitizeText(corrections[id], 80)
      const hits = validFound.filter((id) => HALLUCINATION_ERROR_IDS.includes(id)).length
      const misses = validFound.length - hits
      return {
        correct: Math.max(0, hits - misses),
        total: HALLUCINATION_ERROR_IDS.length,
        payload: { found: validFound, corrections: cleanCorrections },
      }
    }
    case 'traffic': {
      const answers = (data.answers ?? {}) as Record<string, unknown>
      const clean: Record<string, Light> = {}
      let correct = 0
      for (const c of TRAFFIC_CASES) {
        const v = answers[c.id]
        if (v === 'green' || v === 'yellow' || v === 'red') {
          clean[c.id] = v
          if (v === c.answer) correct++
        }
      }
      return { correct, total: TRAFFIC_CASES.length, payload: { answers: clean } }
    }
    case 'ai-data': {
      const answers = (data.answers ?? {}) as Record<string, unknown>
      const clean: Record<string, boolean> = {}
      for (const item of AI_DATA_CASES) {
        if (typeof answers[item.id] !== 'boolean') return null
        clean[item.id] = answers[item.id] as boolean
      }
      const correct = AI_DATA_CASES.filter((item) => clean[item.id] === item.shareable).length
      return { correct, total: AI_DATA_CASES.length, payload: { answers: clean } }
    }
    default:
      return null
  }
}

export function isActivityId(value: unknown): value is ActivityId {
  return typeof value === 'string' && value in ACTIVITY_LABELS
}
