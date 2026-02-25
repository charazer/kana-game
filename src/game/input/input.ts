import { VALID_ROMAJI_CHARS } from '../constants/kana-constants'

// Hiragana: U+3040–U+309F, Katakana: U+30A0–U+30FF
function isKanaChar(ch: string): boolean {
  const code = ch.codePointAt(0)!
  return code >= 0x3040 && code <= 0x30FF
}

/** Filter a string to only valid romaji and kana characters */
function filterValidChars(raw: string): string {
  return [...raw].filter(c => VALID_ROMAJI_CHARS.has(c) || isKanaChar(c)).join('')
}

export class InputManager {
  private _buffer = ''
  private _enabled = false
  private inputElement: HTMLInputElement | null = null
  private isTouchDevice = false

  onKey: (buffer: string) => void = () => {}
  onCommit: (value: string) => void = () => {}

  get buffer(): string { return this._buffer }
  set buffer(val: string) {
    this._buffer = val
    if (this.inputElement) this.inputElement.value = val
  }

  get enabled(): boolean { return this._enabled }
  set enabled(val: boolean) {
    this._enabled = val
    if (this.inputElement && this.isTouchDevice) {
      if (val) this.inputElement.focus()
      else this.inputElement.blur()
    }
  }

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (!this._enabled) return

      // Let the bound input element's handler manage when it has focus
      if (this.inputElement && document.activeElement === this.inputElement) return

      if (e.key === 'Backspace') {
        this._buffer = this._buffer.slice(0, -1)
        this.onKey(this._buffer)
        e.preventDefault()
        return
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        const lower = e.key.toLowerCase()
        // Only accept valid romaji or direct kana (IME) input
        if (!VALID_ROMAJI_CHARS.has(lower) && !isKanaChar(e.key)) return
        this._buffer += lower
        this.onKey(this._buffer)
        // Auto-commit after each keystroke
        this.onCommit(this._buffer)
      }
    })
  }

  /**
   * Bind an HTML input element for mobile software keyboard support.
   */
  bindElement(el: HTMLInputElement): void {
    this.inputElement = el
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    el.addEventListener('input', () => {
      if (!this._enabled) {
        el.value = ''
        return
      }

      const filtered = filterValidChars(el.value.toLowerCase())
      const previousBuffer = this._buffer
      this._buffer = filtered
      el.value = filtered
      this.onKey(this._buffer)

      // Only commit when characters were added (not backspace / deletion)
      if (filtered.length > previousBuffer.length && this._buffer) {
        this.onCommit(this._buffer)
      }
    })

    // Re-focus when blurred during active gameplay on touch devices
    el.addEventListener('blur', () => {
      if (this._enabled && this.isTouchDevice) {
        setTimeout(() => {
          if (this._enabled) el.focus()
        }, 10)
      }
    })
  }
}
