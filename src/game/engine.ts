import kanaHiragana from '../data/kana/hiragana.json'
import kanaKatakana from '../data/kana/katakana.json'
import type { KanaEntry } from './types'
import { exactMatch, longestRomajiMatch } from './matcher'

export type Renderer = {
  createTokenEl: (id: string, kana: string) => HTMLElement
  removeTokenEl: (el: HTMLElement) => void
  setTokenPosition: (el: HTMLElement, x: number, y: number) => void
  flashToken: (el: HTMLElement, success: boolean) => void
  showFloatingText: (x: number, y: number, text: string, type: 'points' | 'combo' | 'life' | 'speed') => void
  getHeight: () => number
}


import type { InputManager } from './input'

export class GameEngine {
  renderer: Renderer
  input: InputManager
  running = false
  last = 0
  tokens: Array<{ id: string; entry: KanaEntry; el: HTMLElement; kana: string; y: number; x:number; spawnTime: number }>
  score = 0
  lives = 3
  combo = 0
  gameTime = 0 // total time elapsed in current game
  gameMode: 'practice' | 'timed' = 'timed'
  onScore: (s: number) => void
  onLivesChange: (lives: number, previousLives?: number) => void
  onGameOver: () => void
  onCombo?: (combo: number) => void
  onSpeedChange?: (multiplier: number) => void
  kanaSet: KanaEntry[] = []
  kanaLastSeen: Map<string, number> = new Map() // track when each kana was last shown
  spawnAccumulator = 0
  spawnInterval = 0.9 // seconds
  baseSpeed = 60 // base pixels/sec
  speed = 60 // current pixels/sec
  lastSpeedMultiplier = 1.0 // track last speed multiplier to detect changes
  maxActiveTokens = 8 // limit to prevent overwhelming player

  constructor(opts: { renderer: Renderer; input: InputManager; onScore?: (s: number) => void; onLivesChange?: (lives: number, previousLives?: number) => void; onGameOver?: () => void; onCombo?: (combo: number) => void; onSpeedChange?: (multiplier: number) => void }){
    this.renderer = opts.renderer
    this.input = opts.input
    this.tokens = []
    this.onScore = opts.onScore || (()=>{})
    this.onLivesChange = opts.onLivesChange || (()=>{})
    this.onGameOver = opts.onGameOver || (()=>{})
    this.onCombo = opts.onCombo
    this.onSpeedChange = opts.onSpeedChange
    this.input.onKey = (buffer) => this.handleInput(buffer)
    this.input.onCommit = (value) => this.handleCommit(value)
    this.loadKana('hiragana')
  }

  start(){
    this.running = true
    this.last = performance.now()
    requestAnimationFrame(this.loop.bind(this))
  }

  setGameMode(mode: 'practice' | 'timed'){
    this.gameMode = mode
    // Adjust settings based on mode
    if(mode === 'practice'){
      this.baseSpeed = 40 // slower for practice
      this.speed = 40
      this.maxActiveTokens = 5 // fewer tokens
    } else {
      this.baseSpeed = 60 // normal speed for timed
      this.speed = 60
      this.maxActiveTokens = 8
    }
  }

  pause(){
    this.running = false
  }

  resume(){
    if(!this.running){
      this.running = true
      this.last = performance.now()
      requestAnimationFrame(this.loop.bind(this))
    }
  }

  reset(){
    this.running = false
    this.score = 0
    this.lives = 3
    this.combo = 0
    this.gameTime = 0
    this.speed = this.baseSpeed
    this.lastSpeedMultiplier = 1.0
    this.tokens.forEach(t => this.renderer.removeTokenEl(t.el))
    this.tokens = []
    this.kanaLastSeen.clear()
    this.spawnAccumulator = 0
    this.input.buffer = ''
    this.onScore(this.score)
    this.onLivesChange(this.lives)
    if(this.onCombo) this.onCombo(this.combo)
  }

  loop(now: number){
    const dt = (now - this.last)/1000
    this.last = now
    
    // Track game time and increase speed gradually (only in timed mode)
    this.gameTime += dt
    if(this.gameMode === 'timed'){
      // Speed increases by 10% every 15 seconds (no cap)
      const speedMultiplier = 1 + (Math.floor(this.gameTime / 15) * 0.10)
      // Notify only when multiplier increases AND game has been running for at least 1 second
      // (prevents triggering on game start)
      if(speedMultiplier > this.lastSpeedMultiplier && this.gameTime > 1.0 && this.onSpeedChange){
        this.onSpeedChange(speedMultiplier)
      }
      this.lastSpeedMultiplier = speedMultiplier
      this.speed = this.baseSpeed * speedMultiplier
    }

    // spawn by timer
    this.spawnAccumulator += dt
    if(this.spawnAccumulator >= this.spawnInterval){
      this.spawnAccumulator = 0
      this.spawnToken()
    }

    // update tokens
    const failureY = this.renderer.getHeight() - 80 // 80px danger zone
    for(const t of [...this.tokens]){
      t.y += this.speed * dt
      this.renderer.setTokenPosition(t.el, t.x, t.y)
      if(t.y > failureY){
        // Token missed - flash red before removing
        this.renderer.flashToken(t.el, false)
        setTimeout(() => {
          this.renderer.removeTokenEl(t.el)
        }, 300)
        this.tokens = this.tokens.filter(x=>x!==t)
        
        // In practice mode, don't lose lives
        if(this.gameMode === 'timed'){
          // Lose a life and reset combo
          const previousLives = this.lives
          this.lives--
          this.combo = 0
          this.onLivesChange(this.lives, previousLives)
          if(this.onCombo) this.onCombo(this.combo)
          
          // Show life lost indicator
          this.renderer.showFloatingText(t.x + 36, t.y + 36, '💔 -1', 'life')
          
          // Check for game over
          if(this.lives <= 0){
            this.running = false
            this.onGameOver()
            return
          }
        } else {
          // In practice mode, just reset combo
          this.combo = 0
          if(this.onCombo) this.onCombo(this.combo)
        }
      }
    }

    if(this.running) requestAnimationFrame(this.loop.bind(this))
  }

  spawnToken(){
    if(this.kanaSet.length === 0) return
    if(this.tokens.length >= this.maxActiveTokens) return // don't spawn if at limit
    
    // Calculate weights based on recency (last seen time)
    const now = performance.now()
    const weights: number[] = []
    
    for(const kana of this.kanaSet){
      const lastSeen = this.kanaLastSeen.get(kana.id) || 0
      const timeSince = now - lastSeen
      
      // Weight increases with time since last seen
      // Never seen = max weight (10000)
      // Recent (< 5s) = low weight (1)
      // Old (> 30s) = high weight (100)
      let weight = 1
      if(lastSeen === 0){
        weight = 10000 // strongly prefer unseen kana
      } else if(timeSince < 5000){
        weight = 1 // very recently seen
      } else if(timeSince < 15000){
        weight = 10 // somewhat recent
      } else if(timeSince < 30000){
        weight = 50 // moderately old
      } else {
        weight = 100 // not seen in a while
      }
      weights.push(weight)
    }
    
    // Weighted random selection
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    let random = Math.random() * totalWeight
    let selectedIndex = 0
    
    for(let i = 0; i < weights.length; i++){
      random -= weights[i]
      if(random <= 0){
        selectedIndex = i
        break
      }
    }
    
    const entry = this.kanaSet[selectedIndex]
    this.kanaLastSeen.set(entry.id, now)
    
    const el = this.renderer.createTokenEl(entry.id, entry.kana)
    const width = (this.renderer as any).getWidth ? (this.renderer as any).getWidth() : 400
    const tokenWidth = 72 // token width from CSS
    const margin = 20 // left/right margin
    
    // Calculate safe spawn range to prevent cutoff
    const safeWidth = width - (margin * 2) - tokenWidth
    let x = margin + Math.floor(Math.random() * Math.max(0, safeWidth))
    
    // Check for overlap with existing tokens and adjust if needed
    const minDistance = 100 // minimum horizontal distance between tokens
    let attempts = 0
    while(attempts < 10){
      const overlapping = this.tokens.some(t => {
        const distance = Math.abs(t.x - x)
        const verticalDiff = Math.abs(t.y - 0)
        return distance < minDistance && verticalDiff < 150
      })
      if(!overlapping) break
      x = margin + Math.floor(Math.random() * Math.max(0, safeWidth))
      attempts++
    }
    
    this.renderer.setTokenPosition(el, x, 0)
    this.tokens.push({ id: entry.id, entry, el, kana: entry.kana, y: 0, x, spawnTime: performance.now() })
  }

  handleInput(buffer: string){
    // highlight candidates or provide feedback; for now no-op
  }

  handleCommit(value: string){
    if(!value) return
    
    // Try longest romaji match first (supports chaining like "shika" -> "shi" + "ka")
    const best = longestRomajiMatch(this.tokens.map(t=>t.entry), value)
    if(best){
      const idx = this.tokens.findIndex(t => t.entry.id === best.entry.id)
      if(idx >= 0){
        const t = this.tokens[idx]
        // Flash green on success
        this.renderer.flashToken(t.el, true)
        setTimeout(() => {
          this.renderer.removeTokenEl(t.el)
        }, 200)
        this.tokens.splice(idx,1)
        
        // Calculate score with combo multiplier
        const basePoints = 10
        const elapsed = (performance.now() - t.spawnTime) / 1000
        const lifetime = (this.renderer.getHeight() - 80) / this.speed // time to reach danger zone
        const timeBonus = Math.max(0, Math.min(10, Math.round((lifetime - elapsed) / lifetime * 10)))
        const comboMultiplier = 1 + (this.combo * 0.05)
        const points = Math.round((basePoints + timeBonus) * comboMultiplier)
        
        this.combo++
        this.score += points
        this.onScore(this.score)
        if(this.onCombo) this.onCombo(this.combo)
        
        // Show floating points text
        this.renderer.showFloatingText(t.x + 36, t.y + 36, `+${points}`, 'points')
        if(this.combo > 1) {
          this.renderer.showFloatingText(t.x + 36, t.y + 60, `${this.combo}x`, 'combo')
        }
        
        // Consume only the matched portion from buffer
        const matchedLength = best.romaji.length
        this.input.buffer = this.input.buffer.slice(matchedLength)
        this.input.onKey(this.input.buffer)
        
        // Don't recursively match - wait for next keystroke
        // This prevents multiple tokens from being cleared in one action
        return
      }
    }
    
    // Fallback: try exact kana match (for IME input)
    const matchIndex = this.tokens.findIndex(t => exactMatch(t.entry as any, value))
    if(matchIndex >= 0){
      const t = this.tokens[matchIndex]
      // Flash green on success
      this.renderer.flashToken(t.el, true)
      setTimeout(() => {
        this.renderer.removeTokenEl(t.el)
      }, 200)
      this.tokens.splice(matchIndex,1)
      
      // Calculate score with combo multiplier
      const basePoints = 10
      const elapsed = (performance.now() - t.spawnTime) / 1000
      const lifetime = (this.renderer.getHeight() - 80) / this.speed // time to reach danger zone
      const timeBonus = Math.max(0, Math.min(10, Math.round((lifetime - elapsed) / lifetime * 10)))
      const comboMultiplier = 1 + (this.combo * 0.05)
      const points = Math.round((basePoints + timeBonus) * comboMultiplier)
      
      this.combo++
      this.score += points
      this.onScore(this.score)
      if(this.onCombo) this.onCombo(this.combo)
      
      // Show floating points text
      this.renderer.showFloatingText(t.x + 36, t.y + 36, `+${points}`, 'points')
      if(this.combo > 1) {
        this.renderer.showFloatingText(t.x + 36, t.y + 60, `${this.combo}x`, 'combo')
      }
      // Clear buffer for exact kana match (IME)
      this.input.buffer = ''
      this.input.onKey('')
      return
    }
  }

  async loadKana(setName: string){
    if(setName === 'katakana'){
      this.kanaSet = kanaKatakana as any
    } else {
      // default to hiragana
      this.kanaSet = kanaHiragana as any
    }
  }
}
