import { playKotoArpeggio, playKotoPluck, playTaikoDrum, playWindChime, YO_SCALE } from './audio-helpers'

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

  /**
   * Tile resolved — random koto pluck from the Yo scale.
   * A different note is chosen each time so the sound stays fresh
   * even after hundreds of correct answers.
   *
   * Two plucks sound together for richness (合わせ awase technique):
   *   • main note at normal volume
   *   • octave-below root at lower volume for warmth
   */
  playSuccess() {
    if (!this.enabled || !this.ctx) return
    const note = YO_SCALE[Math.floor(Math.random() * YO_SCALE.length)]
    playKotoPluck(this.ctx, { frequency: note, volume: 0.1, duration: 0.25 })
    playKotoPluck(this.ctx, { frequency: note * 0.5, volume: 0.06, duration: 0.3 })
  }

  /**
   * Game over — gentle descending F-major koto phrase.
   * Stays in the bright pentatonic so the ending feels uplifting.
   */
  playGameOver() {
    if (!this.enabled || !this.ctx) return
    playKotoArpeggio(this.ctx, [
      { frequency: YO_SCALE[5], delay: 0,   duration: 0.4 },
      { frequency: YO_SCALE[3], delay: 0.2, duration: 0.4 },
      { frequency: YO_SCALE[1], delay: 0.4, duration: 0.4 },
      { frequency: YO_SCALE[0], delay: 0.6, duration: 0.6 },
    ])
  }

  /**
   * Life lost — taiko drum hit (太鼓).
   * A single impactful low-frequency thud.
   */
  playLifeLost() {
    if (!this.enabled || !this.ctx) return
    playTaikoDrum(this.ctx, { volume: 0.2, duration: 0.3 })
  }

  /**
   * Speed increase — quick ascending koto run on the Yo scale.
   */
  playSpeedIncrease() {
    if (!this.enabled || !this.ctx) return
    playKotoArpeggio(this.ctx, [
      { frequency: YO_SCALE[3], delay: 0,    duration: 0.2 },
      { frequency: YO_SCALE[4], delay: 0.06, duration: 0.2 },
      { frequency: YO_SCALE[5], delay: 0.12, duration: 0.2 },
    ])
  }

  /**
   * Game start — ascending Yo-scale koto arpeggio (ceremonial feel).
   */
  playGameStart() {
    if (!this.enabled || !this.ctx) return
    playKotoArpeggio(this.ctx, [
      { frequency: YO_SCALE[0], delay: 0,   duration: 0.3 },
      { frequency: YO_SCALE[2], delay: 0.1, duration: 0.3 },
      { frequency: YO_SCALE[3], delay: 0.2, duration: 0.3 },
      { frequency: YO_SCALE[5], delay: 0.3, duration: 0.3 },
    ])
  }

  /** Pause — gentle wind chime (風鈴) on C5. */
  playPause() {
    if (!this.enabled || !this.ctx) return
    playWindChime(this.ctx, 523.25, { volume: 0.06, duration: 0.4 })
  }

  /** Resume — bright wind chime on F5. */
  playResume() {
    if (!this.enabled || !this.ctx) return
    playWindChime(this.ctx, 698.46, { volume: 0.06, duration: 0.4 })
  }
}
