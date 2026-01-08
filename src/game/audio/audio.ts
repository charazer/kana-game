import { playArpeggio, playChord, playSlide, type AudioNote } from './audio-helpers'

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
    
    // Happy ascending notes - using helper
    playChord(this.audioContext, [523.25, 659.25], {
      type: 'sine',
      volume: 0.15,
      duration: 0.15
    })
  }

  playGameOver() {
    if (!this.enabled || !this.audioContext) return
    
    // Descending arpeggio - using helper
    const notes: AudioNote[] = [
      { frequency: 392, type: 'triangle', volume: 0.2, duration: 0.2, delay: 0 },
      { frequency: 349.23, type: 'triangle', volume: 0.2, duration: 0.2, delay: 0.15 },
      { frequency: 293.66, type: 'triangle', volume: 0.2, duration: 0.2, delay: 0.30 },
      { frequency: 261.63, type: 'triangle', volume: 0.2, duration: 0.2, delay: 0.45 }
    ]
    playArpeggio(this.audioContext, notes)
  }

  playLifeLost() {
    if (!this.enabled || !this.audioContext) return
    
    // Sharp descending tone - using helper
    playSlide(this.audioContext, 440, 220, {
      type: 'sawtooth',
      volume: 0.3,
      duration: 0.2
    })
  }

  playSpeedIncrease() {
    if (!this.enabled || !this.audioContext) return
    
    // Fast upward arpeggio - exciting and recognizable
    const notes: AudioNote[] = [
      { frequency: 392, type: 'sine', volume: 0.18, duration: 0.15, delay: 0 },
      { frequency: 493.88, type: 'sine', volume: 0.18, duration: 0.15, delay: 0.08 },
      { frequency: 587.33, type: 'sine', volume: 0.18, duration: 0.15, delay: 0.16 },
      { frequency: 783.99, type: 'sine', volume: 0.18, duration: 0.15, delay: 0.24 }
    ]
    playArpeggio(this.audioContext, notes)
  }

  playGameStart() {
    if (!this.enabled || !this.audioContext) return
    
    // Rising chord - energetic start
    const notes: AudioNote[] = [
      { frequency: 261.63, type: 'sine', volume: 0.15, duration: 0.2, delay: 0 },
      { frequency: 329.63, type: 'sine', volume: 0.15, duration: 0.2, delay: 0.05 },
      { frequency: 392, type: 'sine', volume: 0.15, duration: 0.2, delay: 0.10 }
    ]
    playArpeggio(this.audioContext, notes)
  }

  playPause() {
    if (!this.enabled || !this.audioContext) return
    
    // Short descending tone - using helper
    playSlide(this.audioContext, 523.25, 392, {
      type: 'sine',
      volume: 0.12,
      duration: 0.15
    })
  }

  playResume() {
    if (!this.enabled || !this.audioContext) return
    
    // Short ascending tone - using helper
    playSlide(this.audioContext, 392, 523.25, {
      type: 'sine',
      volume: 0.12,
      duration: 0.15
    })
  }
}
