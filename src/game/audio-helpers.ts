/**
 * Audio helper utilities for sound generation
 * Extracts common patterns from audio.ts to reduce duplication
 */

export interface AudioNote {
  frequency: number
  type?: OscillatorType
  volume?: number
  duration?: number
  delay?: number
}

export interface AudioOscillatorConfig {
  frequency: number | 'slide'
  frequencyStart?: number
  frequencyEnd?: number
  type: OscillatorType
  volume: number
  duration: number
  startTime: number
}

/**
 * Creates and plays a single oscillator with automatic cleanup
 */
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

/**
 * Plays a sequence of notes as an arpeggio
 */
export function playArpeggio(
  audioContext: AudioContext,
  notes: AudioNote[],
  baseTime: number = audioContext.currentTime
): void {
  notes.forEach((note, i) => {
    const startTime = baseTime + (note.delay ?? i * 0.1)
    playOscillator(audioContext, {
      frequency: note.frequency,
      type: note.type ?? 'sine',
      volume: note.volume ?? 0.15,
      duration: note.duration ?? 0.2,
      startTime
    })
  })
}

/**
 * Plays multiple notes simultaneously as a chord
 */
export function playChord(
  audioContext: AudioContext,
  frequencies: number[],
  options: {
    type?: OscillatorType
    volume?: number
    duration?: number
    startTime?: number
  } = {}
): void {
  const {
    type = 'sine',
    volume = 0.15,
    duration = 0.15,
    startTime = audioContext.currentTime
  } = options

  frequencies.forEach(freq => {
    playOscillator(audioContext, {
      frequency: freq,
      type,
      volume,
      duration,
      startTime
    })
  })
}

/**
 * Plays a frequency slide (pitch bend)
 */
export function playSlide(
  audioContext: AudioContext,
  fromFreq: number,
  toFreq: number,
  options: {
    type?: OscillatorType
    volume?: number
    duration?: number
    startTime?: number
  } = {}
): void {
  const {
    type = 'sine',
    volume = 0.15,
    duration = 0.2,
    startTime = audioContext.currentTime
  } = options

  playOscillator(audioContext, {
    frequency: 'slide',
    frequencyStart: fromFreq,
    frequencyEnd: toFreq,
    type,
    volume,
    duration,
    startTime
  })
}
