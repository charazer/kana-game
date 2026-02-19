import { VALID_ROMAJI_CHARS } from '../constants/kana-constants'

// Hiragana: U+3040–U+309F, Katakana: U+30A0–U+30FF
function isKanaChar(ch: string): boolean {
  const code = ch.codePointAt(0)!
  return code >= 0x3040 && code <= 0x30FF
}

export class InputManager{
  buffer = ''
  enabled = false
  onKey: (buffer: string) => void = ()=>{}
  onCommit: (value: string) => void = ()=>{}

  constructor(){
    window.addEventListener('keydown', (e)=>{
      if(!this.enabled) return

      if(e.key === 'Backspace'){
        this.buffer = this.buffer.slice(0,-1)
        this.onKey(this.buffer)
        e.preventDefault()
        return
      }
      if(e.key.length === 1 && !e.ctrlKey && !e.metaKey){
        const lower = e.key.toLowerCase()
        // Only accept valid romaji characters or direct kana (IME) input
        if(!VALID_ROMAJI_CHARS.has(lower) && !isKanaChar(e.key)) return
        this.buffer += lower
        this.onKey(this.buffer)
        // Auto-commit after each keystroke
        this.onCommit(this.buffer)
      }
    })
  }
}
