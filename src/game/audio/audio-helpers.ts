/**
 * Audio helper utilities for Japanese-themed sound generation.
 *
 * Instrument timbres synthesised with the Web Audio API:
 *   Koto  (箏)  — plucked string via layered harmonics with fast attack
 *   Taiko (太鼓) — percussive drum via low sine with pitch-bend
 *   Fūrin (風鈴) — wind-chime shimmer via detuned sine pair
 *
 * Scale matched to the background music (F major throughout):
 *   F major pentatonic: F  G  A  C  D
 */

// ─── Japanese Pentatonic Scale (Hz) ─────────────────────────────────────────

/** F major pentatonic — bright / ceremonial, spanning F4–F5 */
export const YO_SCALE = [
  349.23,  // F4
  392.0,   // G4
  440.0,   // A4
  523.25,  // C5
  587.33,  // D5
  698.46,  // F5
] as const

// ─── Types ──────────────────────────────────────────────────────────────────

export type AudioOscillatorConfig = {
  frequency: number | 'slide'
  frequencyStart?: number
  frequencyEnd?: number
  type: OscillatorType
  volume: number
  duration: number
  startTime: number
}

export type KotoPluckConfig = {
  frequency: number
  volume?: number
  duration?: number
  startTime?: number
}

// ─── Core: Single Oscillator ────────────────────────────────────────────────

/** Creates and plays a single oscillator with gain envelope and automatic cleanup. */
export function playOscillator(
  audioContext: AudioContext,
  config: AudioOscillatorConfig
): void {
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()

  osc.connect(gain)
  gain.connect(audioContext.destination)

  osc.type = config.type

  // Handle frequency (static or slide)
  if (config.frequency === 'slide' && config.frequencyStart && config.frequencyEnd) {
    osc.frequency.setValueAtTime(config.frequencyStart, config.startTime)
    osc.frequency.exponentialRampToValueAtTime(config.frequencyEnd, config.startTime + config.duration * 0.5)
  } else if (typeof config.frequency === 'number') {
    osc.frequency.value = config.frequency
  }

  // Setup gain envelope
  gain.gain.setValueAtTime(config.volume, config.startTime)
  gain.gain.exponentialRampToValueAtTime(0.01, config.startTime + config.duration)

  osc.start(config.startTime)
  osc.stop(config.startTime + config.duration)
}

// ─── Instrument: Koto Pluck (箏) ────────────────────────────────────────────

/**
 * Simulates a koto string pluck using three layered harmonics:
 *   1× fundamental  (triangle) — warm body
 *   2× octave       (sine)     — brightness
 *   3× fifth        (sine)     — shimmer
 *
 * Each partial has a sharp attack (≈ 5 ms linear ramp) followed by an
 * exponential decay whose length decreases for higher harmonics, mimicking
 * the natural behaviour of a plucked string.
 */
export function playKotoPluck(
  ctx: AudioContext,
  config: KotoPluckConfig
): void {
  const {
    frequency,
    volume = 0.12,
    duration = 0.35,
    startTime = ctx.currentTime,
  } = config

  const harmonics: { mult: number; type: OscillatorType; amp: number; decay: number }[] = [
    { mult: 1,     type: 'triangle', amp: 1.0,  decay: duration },
    { mult: 2,     type: 'sine',     amp: 0.35, decay: duration * 0.6 },
    { mult: 2.997, type: 'sine',     amp: 0.15, decay: duration * 0.4 },
  ]

  for (const h of harmonics) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = h.type
    osc.frequency.value = frequency * h.mult

    const v = volume * h.amp
    gain.gain.setValueAtTime(0.01, startTime)
    gain.gain.linearRampToValueAtTime(v, startTime + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + h.decay)

    osc.start(startTime)
    osc.stop(startTime + h.decay)
  }
}

// ─── Compound: Koto Arpeggio ────────────────────────────────────────────────

/** Plays a sequence of koto plucks as a melodic phrase. */
export function playKotoArpeggio(
  ctx: AudioContext,
  notes: { frequency: number; delay?: number; volume?: number; duration?: number }[],
  baseTime: number = ctx.currentTime
): void {
  notes.forEach((note, i) => {
    playKotoPluck(ctx, {
      frequency: note.frequency,
      volume: note.volume ?? 0.12,
      duration: note.duration ?? 0.35,
      startTime: baseTime + (note.delay ?? i * 0.12),
    })
  })
}

// ─── Instrument: Taiko Drum (太鼓) ──────────────────────────────────────────

/**
 * Resonant drum hit: a sine with fast pitch-bend downward (150 → 60 Hz)
 * and an exponential volume decay.
 */
export function playTaikoDrum(
  ctx: AudioContext,
  options: { volume?: number; duration?: number; startTime?: number } = {}
): void {
  const {
    volume = 0.25,
    duration = 0.3,
    startTime = ctx.currentTime,
  } = options

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, startTime)
  osc.frequency.exponentialRampToValueAtTime(60, startTime + 0.08)

  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

  osc.start(startTime)
  osc.stop(startTime + duration)
}

// ─── Instrument: Wind Chime / Fūrin (風鈴) ──────────────────────────────────

/**
 * Bright shimmer created by two slightly detuned sine oscillators.
 * The ±6-cent spread produces a gentle beating that evokes the metallic
 * ring of a Japanese wind chime.
 */
export function playWindChime(
  ctx: AudioContext,
  frequency: number,
  options: { volume?: number; duration?: number; startTime?: number } = {}
): void {
  const {
    volume = 0.08,
    duration = 0.5,
    startTime = ctx.currentTime,
  } = options

  const DETUNE_CENTS = 6

  for (const detune of [-DETUNE_CENTS, DETUNE_CENTS]) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.value = frequency
    osc.detune.value = detune

    gain.gain.setValueAtTime(volume, startTime)
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

    osc.start(startTime)
    osc.stop(startTime + duration)
  }
}
