'use client'

let ctx: AudioContext | null = null

function audio() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.12) {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = ac.currentTime + start
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + duration + 0.02)
}

export const sfx = {
  click: () => tone(660, 0, 0.08, 'square', 0.05),
  success: () => {
    tone(523, 0, 0.12, 'triangle')
    tone(659, 0.1, 0.12, 'triangle')
    tone(784, 0.2, 0.25, 'triangle')
  },
  error: () => {
    tone(220, 0, 0.18, 'sawtooth', 0.07)
    tone(165, 0.15, 0.25, 'sawtooth', 0.07)
  },
  fanfare: () => {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle'))
  },
}
