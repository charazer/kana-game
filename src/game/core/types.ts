import type { FloatingTextType } from '../constants/constants'

export type KanaEntry = {
  id: string
  kana: string
  romaji: string[]
  type: 'hiragana'|'katakana'
  audio?: string
}

export type Renderer = {
  createTokenEl: (id: string, kana: string) => HTMLElement
  removeTokenEl: (el: HTMLElement) => void
  setTokenPosition: (el: HTMLElement, x: number, y: number) => void
  flashToken: (el: HTMLElement, success: boolean) => void
  showFloatingText: (x: number, y: number, text: string, type: FloatingTextType) => void
  getWidth: () => number
  getHeight: () => number
  getDangerZoneHeight: () => number
}
