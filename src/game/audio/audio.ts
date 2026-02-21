import { playArpeggio, playChord, playSlide } from './audio-helpers'

export class AudioManager {
  private ctx: AudioContext | null = null
  private enabled = true
  private musicElement: HTMLAudioElement | null = null
  private musicEnabled = false
  private musicUrlLoader: (() => Promise<string>) | null = null
  private musicVolume = 0.3
  private musicLoading = false

  constructor() {
    try {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
    } catch {
      console.warn('Web Audio API not supported')
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  async initMusic(musicUrlLoader: () => Promise<string>, volume = 0.3) {
    this.musicUrlLoader = musicUrlLoader
    this.musicVolume = volume
  }

  private async loadMusic() {
    if (this.musicElement || this.musicLoading || !this.musicUrlLoader) return

    this.musicLoading = true
    try {
      const musicUrl = await this.musicUrlLoader()
      this.musicElement = new Audio(musicUrl)
      this.musicElement.loop = true
      this.musicElement.volume = this.musicVolume
      this.musicElement.preload = 'auto'
    } catch (e) {
      console.warn('Failed to load background music', e)
    } finally {
      this.musicLoading = false
    }
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.musicElement) this.musicElement.volume = this.musicVolume
  }

  async setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
    if (enabled) {
      await this.loadMusic()
      this.musicElement?.play().catch(e => console.warn('Failed to play background music', e))
    } else {
      this.musicElement?.pause()
    }
  }

  stopMusic() {
    if (!this.musicElement) return
    this.musicElement.pause()
    this.musicElement.currentTime = 0
  }

  playSuccess() {
    if (!this.enabled || !this.ctx) return
    playChord(this.ctx, [523.25, 659.25], { type: 'sine', volume: 0.15, duration: 0.15 })
  }

  playGameOver() {
    if (!this.enabled || !this.ctx) return
    playArpeggio(this.ctx, [
      { frequency: 392, type: 'triangle', volume: 0.2, duration: 0.2, delay: 0 },
      { frequency: 349.23, type: 'triangle', volume: 0.2, duration: 0.2, delay: 0.15 },
      { frequency: 293.66, type: 'triangle', volume: 0.2, duration: 0.2, delay: 0.30 },
      { frequency: 261.63, type: 'triangle', volume: 0.2, duration: 0.2, delay: 0.45 },
    ])
  }

  playLifeLost() {
    if (!this.enabled || !this.ctx) return
    playSlide(this.ctx, 440, 220, { type: 'sawtooth', volume: 0.3, duration: 0.2 })
  }

  playSpeedIncrease() {
    if (!this.enabled || !this.ctx) return
    playArpeggio(this.ctx, [
      { frequency: 392, type: 'sine', volume: 0.18, duration: 0.15, delay: 0 },
      { frequency: 493.88, type: 'sine', volume: 0.18, duration: 0.15, delay: 0.08 },
      { frequency: 587.33, type: 'sine', volume: 0.18, duration: 0.15, delay: 0.16 },
      { frequency: 783.99, type: 'sine', volume: 0.18, duration: 0.15, delay: 0.24 },
    ])
  }

  playGameStart() {
    if (!this.enabled || !this.ctx) return
    playArpeggio(this.ctx, [
      { frequency: 261.63, type: 'sine', volume: 0.15, duration: 0.2, delay: 0 },
      { frequency: 329.63, type: 'sine', volume: 0.15, duration: 0.2, delay: 0.05 },
      { frequency: 392, type: 'sine', volume: 0.15, duration: 0.2, delay: 0.10 },
    ])
  }

  playPause() {
    if (!this.enabled || !this.ctx) return
    playSlide(this.ctx, 523.25, 392, { type: 'sine', volume: 0.12, duration: 0.15 })
  }

  playResume() {
    if (!this.enabled || !this.ctx) return
    playSlide(this.ctx, 392, 523.25, { type: 'sine', volume: 0.12, duration: 0.15 })
  }
}
