import kanaHiragana from '../data/kana/hiragana.json'
import kanaKatakana from '../data/kana/katakana.json'
import type { KanaEntry } from './types'
import { exactMatch, longestRomajiMatch } from './matcher'
import { BASIC_KANA_IDS, DAKUTEN_KANA_IDS, YOON_KANA_IDS } from './kana-constants'
import { 
  type GameMode, 
  type FloatingTextType,
  type KanaSet,
  GAME_MODE_PRACTICE,
  GAME_MODE_CHALLENGE,
  KANA_SET_HIRAGANA,
  KANA_SET_KATAKANA,
  FLOAT_TYPE_LIFE,
  FLOAT_TYPE_POINTS,
  FLOAT_TYPE_COMBO,
  FLOATING_TEXT_OFFSET_X,
  FLOATING_TEXT_OFFSET_Y,
  FLOATING_TEXT_COMBO_OFFSET_Y,
  COMBO_DISPLAY_SUFFIX,
  INITIAL_LIVES
} from './constants'

export type Renderer = {
  createTokenEl: (id: string, kana: string) => HTMLElement
  removeTokenEl: (el: HTMLElement) => void
  setTokenPosition: (el: HTMLElement, x: number, y: number) => void
  flashToken: (el: HTMLElement, success: boolean) => void
  showFloatingText: (x: number, y: number, text: string, type: FloatingTextType) => void
  getHeight: () => number
}


import type { InputManager } from './input'

// Game constants
const BASE_POINTS = 10
const MAX_TIME_BONUS = 10
const COMBO_MULTIPLIER = 0.05
const SPAWN_INTERVAL = 0.9 // seconds
const DANGER_ZONE = 80 // pixels from bottom
const TOKEN_WIDTH = 72 // pixels
const SPAWN_MARGIN = 20 // pixels
const MIN_TOKEN_DISTANCE = 100 // pixels
const MAX_SPAWN_ATTEMPTS = 10

// Speed progression constants (challenge mode)
const SPEED_INCREASE_INTERVAL = 15 // seconds
const SPEED_INCREASE_PERCENT = 0.10 // 10% per interval
const SPEED_CHANGE_DELAY = 1.0 // seconds to wait before first speed increase

// Weighted spawn system
const WEIGHT_UNSEEN = 10000
const WEIGHT_VERY_RECENT = 1 // < 5 seconds
const WEIGHT_RECENT = 10 // 5-15 seconds
const WEIGHT_MODERATE = 50 // 15-30 seconds
const WEIGHT_OLD = 100 // > 30 seconds
const TIME_THRESHOLD_VERY_RECENT = 5000 // ms
const TIME_THRESHOLD_RECENT = 15000 // ms
const TIME_THRESHOLD_MODERATE = 30000 // ms


// Unlock thresholds (based on correct answers)
const UNLOCK_DAKUTEN_THRESHOLD = 10 // unlock after 10 correct answers
const UNLOCK_YOON_THRESHOLD = 20 // unlock after 20 correct answers

// Spawn overlap detection
const VERTICAL_OVERLAP_THRESHOLD = 150 // pixels

// Practice mode settings
const PRACTICE_BASE_SPEED = 20 // pixels/sec
const PRACTICE_MAX_TOKENS = 5

// Challenge mode settings
const CHALLENGE_BASE_SPEED = 40 // pixels/sec (reduced from 60)
const CHALLENGE_MAX_TOKENS = 8

export class GameEngine {
  renderer: Renderer
  input: InputManager
  running = false
  last = 0
  correctAnswers = 0 // track for progressive difficulty
  tokens: Array<{ id: string; entry: KanaEntry; el: HTMLElement; kana: string; y: number; x:number; spawnTime: number }>
  score = 0
  lives = INITIAL_LIVES
  combo = 0
  gameTime = 0 // total time elapsed in current game
  gameMode: GameMode = GAME_MODE_CHALLENGE
  onScore: (s: number) => void
  onLivesChange: (lives: number, previousLives?: number) => void
  onGameOver: () => void
  onCombo?: (combo: number) => void
  onSpeedChange?: (multiplier: number) => void
  kanaSet: KanaEntry[] = []
  kanaLastSeen: Map<string, number> = new Map() // track when each kana was last shown
  spawnAccumulator = 0
  spawnInterval = SPAWN_INTERVAL
  baseSpeed = CHALLENGE_BASE_SPEED
  speed = CHALLENGE_BASE_SPEED
  lastSpeedMultiplier = 1.0 // track last speed multiplier to detect changes
  maxActiveTokens = CHALLENGE_MAX_TOKENS
  includeDakuten = true // user setting for including dakuten/handakuten
  includeYoon = true // user setting for including yoon

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
    this.loadKana(KANA_SET_HIRAGANA)
  }

  start(){
    this.running = true
    this.last = performance.now()
    requestAnimationFrame(this.loop.bind(this))
  }

  setGameMode(mode: GameMode){
    this.gameMode = mode
    // Adjust settings based on mode
    if(mode === GAME_MODE_PRACTICE){
      this.baseSpeed = PRACTICE_BASE_SPEED
      this.speed = PRACTICE_BASE_SPEED
      this.maxActiveTokens = PRACTICE_MAX_TOKENS
    } else {
      this.baseSpeed = CHALLENGE_BASE_SPEED
      this.speed = CHALLENGE_BASE_SPEED
      this.maxActiveTokens = CHALLENGE_MAX_TOKENS
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
    this.lives = INITIAL_LIVES
    this.combo = 0
    this.correctAnswers = 0
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
    
    // Track game time and increase speed gradually (only in challenge mode)
    this.gameTime += dt
    if(this.gameMode === GAME_MODE_CHALLENGE){
      // Speed increases by SPEED_INCREASE_PERCENT every SPEED_INCREASE_INTERVAL seconds (no cap)
      const speedMultiplier = 1 + (Math.floor(this.gameTime / SPEED_INCREASE_INTERVAL) * SPEED_INCREASE_PERCENT)
      // Notify only when multiplier increases AND game has been running for at least SPEED_CHANGE_DELAY
      // (prevents triggering on game start)
      if(speedMultiplier > this.lastSpeedMultiplier && this.gameTime > SPEED_CHANGE_DELAY && this.onSpeedChange){
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
    const failureY = this.renderer.getHeight() - DANGER_ZONE
    const tokensToRemove: typeof this.tokens = []
    
    for(let i = 0; i < this.tokens.length; i++){
      const t = this.tokens[i]
      t.y += this.speed * dt
      this.renderer.setTokenPosition(t.el, t.x, t.y)
      if(t.y > failureY){
        tokensToRemove.push(t)
      }
    }
    
    // Process removed tokens after iteration
    for(const t of tokensToRemove){
      // Remove from tokens array efficiently
      const idx = this.tokens.indexOf(t)
      if(idx >= 0) this.tokens.splice(idx, 1)
      
      // Flash red on miss (removal happens via animationend)
      this.renderer.flashToken(t.el, false)
      
      // In practice mode, don't lose lives
      if(this.gameMode === GAME_MODE_CHALLENGE){
        // Lose a life and reset combo
        const previousLives = this.lives
        this.lives--
        this.combo = 0
        this.onLivesChange(this.lives, previousLives)
        if(this.onCombo) this.onCombo(this.combo)
        
        // Show life lost indicator
        this.renderer.showFloatingText(t.x + FLOATING_TEXT_OFFSET_X, t.y + FLOATING_TEXT_OFFSET_Y, '💔 -1', FLOAT_TYPE_LIFE)
        
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

    if(this.running) requestAnimationFrame(this.loop.bind(this))
  }

  getAvailableKana(){
    // Progressive difficulty - unlock kana based on correct answers
    const unlockDakuten = this.correctAnswers >= UNLOCK_DAKUTEN_THRESHOLD
    const unlockYoon = this.correctAnswers >= UNLOCK_YOON_THRESHOLD
    
    return this.kanaSet.filter(kana => {
      // Always include basic kana
      if(BASIC_KANA_IDS.includes(kana.id)) return true
      
      // Include dakuten if unlocked AND user setting is enabled
      if(DAKUTEN_KANA_IDS.includes(kana.id)) return unlockDakuten && this.includeDakuten
      
      // Include yoon only if unlocked AND user setting is enabled
      if(YOON_KANA_IDS.includes(kana.id)) return unlockYoon && this.includeYoon
      
      // Unknown kana (shouldn't happen) - include by default
      return true
    })
  }

  getDifficultyMultiplier(): number {
    // Adjust score based on which kana types are enabled
    // Both enabled: 100% score (1.0x)
    // One enabled: 75% score (0.75x)
    // Both disabled: 50% score (0.5x)
    if(this.includeDakuten && this.includeYoon) return 1.0
    if(this.includeDakuten || this.includeYoon) return 0.75
    return 0.5
  }

  calculateScore(token: { spawnTime: number }): number {
    const basePoints = BASE_POINTS
    const elapsed = (performance.now() - token.spawnTime) / 1000
    const lifetime = (this.renderer.getHeight() - DANGER_ZONE) / this.speed
    const timeBonus = Math.max(0, Math.min(MAX_TIME_BONUS, Math.round((lifetime - elapsed) / lifetime * MAX_TIME_BONUS)))
    const comboMultiplier = 1 + (this.combo * COMBO_MULTIPLIER)
    const difficultyMultiplier = this.getDifficultyMultiplier()
    return Math.round((basePoints + timeBonus) * comboMultiplier * difficultyMultiplier)
  }

  spawnToken(){
    if(this.kanaSet.length === 0) return
    if(this.tokens.length >= this.maxActiveTokens) return // don't spawn if at limit
    
    // Get available kana based on progression
    const availableKana = this.getAvailableKana()
    if(availableKana.length === 0) return
    
    // Calculate weights based on recency (last seen time)
    const now = performance.now()
    const weights: number[] = []
    
    for(const kana of availableKana){
      const lastSeen = this.kanaLastSeen.get(kana.id) || 0
      const timeSince = now - lastSeen
      
      // Weight increases with time since last seen
      let weight = WEIGHT_VERY_RECENT
      if(lastSeen === 0){
        weight = WEIGHT_UNSEEN // strongly prefer unseen kana
      } else if(timeSince < TIME_THRESHOLD_VERY_RECENT){
        weight = WEIGHT_VERY_RECENT
      } else if(timeSince < TIME_THRESHOLD_RECENT){
        weight = WEIGHT_RECENT
      } else if(timeSince < TIME_THRESHOLD_MODERATE){
        weight = WEIGHT_MODERATE
      } else {
        weight = WEIGHT_OLD // not seen in a while
      }
      weights.push(weight)
    }
    
    // Weighted random selection with improved randomness
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
    
    const entry = availableKana[selectedIndex]
    this.kanaLastSeen.set(entry.id, now)
    
    const el = this.renderer.createTokenEl(entry.id, entry.kana)
    const width = (this.renderer as any).getWidth ? (this.renderer as any).getWidth() : 400
    
    // Calculate safe spawn range to prevent cutoff
    const safeWidth = width - (SPAWN_MARGIN * 2) - TOKEN_WIDTH
    let x = SPAWN_MARGIN + Math.floor(Math.random() * Math.max(0, safeWidth))
    
    // Check for overlap with existing tokens and adjust if needed
    let attempts = 0
    while(attempts < MAX_SPAWN_ATTEMPTS){
      const overlapping = this.tokens.some(t => {
        const distance = Math.abs(t.x - x)
        const verticalDiff = Math.abs(t.y - 0)
        return distance < MIN_TOKEN_DISTANCE && verticalDiff < VERTICAL_OVERLAP_THRESHOLD
      })
      if(!overlapping) break
      x = SPAWN_MARGIN + Math.floor(Math.random() * Math.max(0, safeWidth))
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
    
    // Don't process input when game is not running (paused or not started)
    if(!this.running) return
    
    // Try longest romaji match first (supports chaining like "shika" -> "shi" + "ka")
    const best = longestRomajiMatch(this.tokens.map(t=>t.entry), value)
    if(best){
      const idx = this.tokens.findIndex(t => t.entry.id === best.entry.id)
      if(idx >= 0){
        const t = this.tokens[idx]
        // Remove from array immediately
        this.tokens.splice(idx,1)
        
        // Flash green on success (removal happens via animationend)
        this.renderer.flashToken(t.el, true)
        
        // Track correct answers for progressive difficulty
        this.correctAnswers++
        
        // Calculate score with combo multiplier
        const points = this.calculateScore(t)
        
        this.combo++
        this.score += points
        this.onScore(this.score)
        if(this.onCombo) this.onCombo(this.combo)
        
        // Show floating points text
        this.renderer.showFloatingText(t.x + FLOATING_TEXT_OFFSET_X, t.y + FLOATING_TEXT_OFFSET_Y, `+${points}`, FLOAT_TYPE_POINTS)
        if(this.combo > 1) {
          this.renderer.showFloatingText(t.x + FLOATING_TEXT_OFFSET_X, t.y + FLOATING_TEXT_COMBO_OFFSET_Y, `${this.combo}${COMBO_DISPLAY_SUFFIX}`, FLOAT_TYPE_COMBO)
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
      // Remove from array immediately
      this.tokens.splice(matchIndex,1)
      
      // Flash green on success (removal happens via animationend)
      this.renderer.flashToken(t.el, true)
      
      // Calculate score with combo multiplier
      const points = this.calculateScore(t)
      
      this.combo++
      this.score += points
      this.onScore(this.score)
      if(this.onCombo) this.onCombo(this.combo)
      
      // Show floating points text
      this.renderer.showFloatingText(t.x + FLOATING_TEXT_OFFSET_X, t.y + FLOATING_TEXT_OFFSET_Y, `+${points}`, FLOAT_TYPE_POINTS)
      if(this.combo > 1) {
        this.renderer.showFloatingText(t.x + FLOATING_TEXT_OFFSET_X, t.y + FLOATING_TEXT_COMBO_OFFSET_Y, `${this.combo}${COMBO_DISPLAY_SUFFIX}`, FLOAT_TYPE_COMBO)
      }
      // Clear buffer for exact kana match (IME)
      this.input.buffer = ''
      this.input.onKey('')
      return
    }
  }

  async loadKana(setName: KanaSet){
    if(setName === KANA_SET_KATAKANA){
      this.kanaSet = kanaKatakana as any
    } else {
      // default to hiragana
      this.kanaSet = kanaHiragana as any
    }
  }
}
