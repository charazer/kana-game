export class AudioManager {
  private audioContext: AudioContext | null = null
  private enabled = true

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API not supported', e)
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  playSuccess() {
    if (!this.enabled || !this.audioContext) return
    
    // Happy ascending notes
    const now = this.audioContext.currentTime
    
    const osc1 = this.audioContext.createOscillator()
    const osc2 = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(this.audioContext.destination)

    osc1.frequency.value = 523.25 // C5
    osc2.frequency.value = 659.25 // E5
    osc1.type = 'sine'
    osc2.type = 'sine'

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.15)
    osc2.stop(now + 0.15)
  }

  playGameOver() {
    if (!this.enabled || !this.audioContext) return
    
    // Descending arpeggio
    const now = this.audioContext.currentTime

    const notes = [392, 349.23, 293.66, 261.63] // G4, F4, D4, C4
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()

      osc.connect(gain)
      gain.connect(this.audioContext!.destination)

      osc.frequency.value = freq
      osc.type = 'triangle'

      const startTime = now + (i * 0.15)
      gain.gain.setValueAtTime(0.2, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2)

      osc.start(startTime)
      osc.stop(startTime + 0.2)
    })
  }

  playLifeLost() {
    if (!this.enabled || !this.audioContext) return
    
    // Sharp descending tone
    const now = this.audioContext.currentTime

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.connect(gain)
    gain.connect(this.audioContext.destination)

    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.2)
    osc.type = 'sawtooth'

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)

    osc.start(now)
    osc.stop(now + 0.2)
  }

  playSpeedIncrease() {
    if (!this.enabled || !this.audioContext) return
    
    // Fast upward arpeggio - exciting and recognizable
    const now = this.audioContext.currentTime

    const notes = [392, 493.88, 587.33, 783.99] // G4, B4, D5, G5
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()

      osc.connect(gain)
      gain.connect(this.audioContext!.destination)

      osc.frequency.value = freq
      osc.type = 'sine'

      const startTime = now + (i * 0.08)
      gain.gain.setValueAtTime(0.18, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)

      osc.start(startTime)
      osc.stop(startTime + 0.15)
    })
  }
}
