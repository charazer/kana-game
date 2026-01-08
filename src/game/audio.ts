export class AudioManager {
  private audioContext: AudioContext | null = null
  private enabled = true
  private musicElement: HTMLAudioElement | null = null
  private musicEnabled = false
  private musicUrlLoader: (() => Promise<string>) | null = null
  private musicVolume = 0.3
  private musicLoading = false

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

  async initMusic(musicUrlLoader: () => Promise<string>, volume = 0.3) {
    this.musicUrlLoader = musicUrlLoader
    this.musicVolume = volume
    // Don't load music immediately - wait until it's actually needed
  }

  private async loadMusic() {
    if (this.musicElement || this.musicLoading || !this.musicUrlLoader) return
    
    this.musicLoading = true
    try {
      const musicUrl = await this.musicUrlLoader()
      this.musicElement = new window.Audio(musicUrl)
      this.musicElement.loop = true
      this.musicElement.volume = this.musicVolume
      this.musicElement.preload = 'auto'
      // The browser will start loading the audio file when Audio is created
    } catch (e) {
      console.warn('Failed to load background music', e)
    } finally {
      this.musicLoading = false
    }
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.musicElement) {
      this.musicElement.volume = this.musicVolume
    }
  }

  async setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
    
    if (enabled) {
      // Load music on demand when user enables it
      await this.loadMusic()
      if (this.musicElement) {
        this.musicElement.play().catch(e => {
          console.warn('Failed to play background music', e)
        })
      }
    } else {
      if (this.musicElement) {
        this.musicElement.pause()
      }
    }
  }

  stopMusic() {
    if (this.musicElement) {
      this.musicElement.pause()
      this.musicElement.currentTime = 0
    }
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

  playGameStart() {
    if (!this.enabled || !this.audioContext) return
    
    // Rising chord - energetic start
    const now = this.audioContext.currentTime

    const notes = [261.63, 329.63, 392] // C4, E4, G4
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()

      osc.connect(gain)
      gain.connect(this.audioContext!.destination)

      osc.frequency.value = freq
      osc.type = 'sine'

      const startTime = now + (i * 0.05)
      gain.gain.setValueAtTime(0.15, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2)

      osc.start(startTime)
      osc.stop(startTime + 0.2)
    })
  }

  playPause() {
    if (!this.enabled || !this.audioContext) return
    
    // Short descending tone
    const now = this.audioContext.currentTime

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.connect(gain)
    gain.connect(this.audioContext.destination)

    osc.frequency.setValueAtTime(523.25, now) // C5
    osc.frequency.exponentialRampToValueAtTime(392, now + 0.1) // G4
    osc.type = 'sine'

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    osc.start(now)
    osc.stop(now + 0.15)
  }

  playResume() {
    if (!this.enabled || !this.audioContext) return
    
    // Short ascending tone
    const now = this.audioContext.currentTime

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.connect(gain)
    gain.connect(this.audioContext.destination)

    osc.frequency.setValueAtTime(392, now) // G4
    osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.1) // C5
    osc.type = 'sine'

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    osc.start(now)
    osc.stop(now + 0.15)
  }
}
