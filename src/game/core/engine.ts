import kanaHiragana from '../../data/kana/hiragana.json'
import kanaKatakana from '../../data/kana/katakana.json'
import type { KanaEntry } from './types'
import { BASIC_KANA_IDS, DAKUTEN_KANA_IDS, YOON_KANA_IDS } from '../constants/kana-constants'
import { findTokenMatch } from './game-helpers'
import { 
  type GameMode, 
  type FloatingTextType,
  type KanaSet,
  GAME_MODE_PRACTICE,
  GAME_MODE_CHALLENGE,
  KANA_SET_HIRAGANA,
  KANA_SET_KATAKANA,
  KANA_SET_MIXED,
  FLOATING_TEXT_OFFSET_X,
  FLOATING_TEXT_OFFSET_Y,
  FLOATING_TEXT_COMBO_OFFSET_Y,
  COMBO_DISPLAY_SUFFIX,
  INITIAL_LIVES,
  BASE_POINTS,
  MAX_TIME_BONUS,
  COMBO_MULTIPLIER,
  DANGER_ZONE,
  TOKEN_WIDTH,
  SPAWN_MARGIN,
  MIN_TOKEN_DISTANCE,
  MAX_SPAWN_ATTEMPTS,
  SPEED_INCREASE_INTERVAL,
  SPEED_BASE_EXPONENT,
  SPEED_CHANGE_DELAY,
  INPUT_ECHO_CLEAR_DELAY,
  UNLOCK_DAKUTEN_THRESHOLD,
  UNLOCK_YOON_THRESHOLD,
  VERTICAL_OVERLAP_THRESHOLD,
  PRACTICE_BASE_SPEED,
  PRACTICE_MAX_TOKENS,
  PRACTICE_SPAWN_INTERVAL,
  CHALLENGE_BASE_SPEED,
  CHALLENGE_MAX_TOKENS,
  CHALLENGE_SPAWN_INTERVAL
} from '../constants/constants'

export type Renderer = {
  createTokenEl: (id: string, kana: string) => HTMLElement
  removeTokenEl: (el: HTMLElement) => void
  setTokenPosition: (el: HTMLElement, x: number, y: number) => void
  flashToken: (el: HTMLElement, success: boolean) => void
  showFloatingText: (x: number, y: number, text: string, type: FloatingTextType) => void
  getHeight: () => number
}

export type SoundPlayer = {
  playSuccess: () => void
  playMiss: () => void
  playCombo: (count: number) => void
}

import type { InputManager } from '../input/input'

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
  kanaSelectionQueue: string[] = [] // queue for round-robin selection (guarantees full cycle)
  kanaRoundCount: Map<string, number> = new Map() // track how many times each kana has been shown
  spawnAccumulator = 0
  spawnInterval = CHALLENGE_SPAWN_INTERVAL // default to challenge mode interval
  baseSpeed = CHALLENGE_BASE_SPEED
  speed = CHALLENGE_BASE_SPEED
  lastSpeedMultiplier = 1.0 // track last speed multiplier to detect changes
  maxActiveTokens = CHALLENGE_MAX_TOKENS
  includeDakuten = true // user setting for including dakuten/handakuten
  includeYoon = true // user setting for including yoon
  currentKanaSet: KanaSet = KANA_SET_HIRAGANA // track current kana set for scoring

  constructor(opts: { renderer: Renderer; input: InputManager; onScore?: (s: number) => void; onLivesChange?: (lives: number, previousLives?: number) => void; onGameOver?: () => void; onCombo?: (combo: number) => void; onSpeedChange?: (multiplier: number) => void }){
    this.renderer = opts.renderer
    this.input = opts.input
    this.tokens = []
    this.onScore = opts.onScore || (()=>{})
    this.onLivesChange = opts.onLivesChange || (()=>{})
    this.onGameOver = opts.onGameOver || (()=>{})
    this.onCombo = opts.onCombo
    this.onSpeedChange = opts.onSpeedChange
    this.input.onCommit = (value) => this.handleCommit(value)
    this.loadKana(KANA_SET_HIRAGANA)
  }

  start(){
    this.running = true
    this.input.enabled = true
    this.last = performance.now()
    // Spawn first token immediately
    this.spawnToken()
    requestAnimationFrame(this.loop.bind(this))
  }

  setGameMode(mode: GameMode){
    this.gameMode = mode
    // Adjust settings based on mode
    if(mode === GAME_MODE_PRACTICE){
      this.baseSpeed = PRACTICE_BASE_SPEED
      this.speed = PRACTICE_BASE_SPEED
      this.maxActiveTokens = PRACTICE_MAX_TOKENS
      this.spawnInterval = PRACTICE_SPAWN_INTERVAL
    } else {
      this.baseSpeed = CHALLENGE_BASE_SPEED
      this.speed = CHALLENGE_BASE_SPEED
      this.maxActiveTokens = CHALLENGE_MAX_TOKENS
      this.spawnInterval = CHALLENGE_SPAWN_INTERVAL
    }
  }

  pause(){
    this.running = false
    this.input.enabled = false
    this.input.buffer = ''
    this.input.onKey('')
  }

  resume(){
    if(!this.running){
      this.running = true
      this.input.enabled = true
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
    this.kanaSelectionQueue = []
    this.kanaRoundCount.clear()
    this.tokens.forEach(t => this.renderer.removeTokenEl(t.el))
    this.tokens = []
    this.kanaLastSeen.clear()
    this.spawnAccumulator = 0
    this.input.enabled = false
    this.input.buffer = ''
    this.input.onKey('')
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
      // Speed increases exponentially: multiplier = BASE^intervals
      const intervals = Math.floor(this.gameTime / SPEED_INCREASE_INTERVAL)
      const speedMultiplier = Math.pow(SPEED_BASE_EXPONENT, intervals)
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
        // Lose a life
        const previousLives = this.lives
        this.lives--
        this.onLivesChange(this.lives, previousLives)
        
        // Show life lost indicator
        this.renderer.showFloatingText(t.x + FLOATING_TEXT_OFFSET_X, t.y + FLOATING_TEXT_OFFSET_Y, '💔 -1', 'life')
        
        // Check for game over
        if(this.lives <= 0){
          this.running = false
          this.input.enabled = false
          this.input.buffer = ''
          this.input.onKey('')
          this.onGameOver()
          return
        }
        
        // Reset combo only if game continues
        this.combo = 0
        if(this.onCombo) this.onCombo(this.combo)
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
    // Base multiplier based on character types enabled
    // Both enabled: 100% score (1.0x)
    // One enabled: 75% score (0.75x)
    // Both disabled: 50% score (0.5x)
    let baseMultiplier = 0.5
    if(this.includeDakuten && this.includeYoon) {
      baseMultiplier = 1.0
    } else if(this.includeDakuten || this.includeYoon) {
      baseMultiplier = 0.75
    }
    
    // Kana set multiplier - mixed gives 25% bonus
    const kanaSetMultiplier = this.currentKanaSet === KANA_SET_MIXED ? 1.25 : 1.0
    
    return baseMultiplier * kanaSetMultiplier
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
    
    const now = performance.now()
    
    // Separate unseen kana from seen kana
    const unseenKana = availableKana.filter(kana => !this.kanaLastSeen.has(kana.id))
    
    let entry
    
    // ALWAYS pick from unseen kana first if any exist
    if(unseenKana.length > 0){
      const randomIndex = Math.floor(Math.random() * unseenKana.length)
      entry = unseenKana[randomIndex]
    } else {
      // All kana have been seen - use round-robin queue for guaranteed distribution
      // Refill queue if empty or if available kana set changed
      const availableIds = availableKana.map(k => k.id).sort().join(',')
      const queueIds = this.kanaSelectionQueue.join(',')
      
      if(this.kanaSelectionQueue.length === 0 || availableIds !== queueIds){
        // Find minimum round count
        const roundCounts = availableKana.map(k => this.kanaRoundCount.get(k.id) || 0)
        const minRoundCount = roundCounts.length > 0 ? Math.min(...roundCounts) : 0

        // Only include kana with minimum round count
        const eligibleKana = availableKana.filter(k => (this.kanaRoundCount.get(k.id) || 0) === minRoundCount)

        // Create new shuffled queue with eligible kana only
        this.kanaSelectionQueue = eligibleKana.map(k => k.id)
        // Fisher-Yates shuffle
        for(let i = this.kanaSelectionQueue.length - 1; i > 0; i--){
          const j = Math.floor(Math.random() * (i + 1))
          ;[this.kanaSelectionQueue[i], this.kanaSelectionQueue[j]] = [this.kanaSelectionQueue[j], this.kanaSelectionQueue[i]]
        }
      }
      
      // Pick from front of queue and remove it
      const nextId = this.kanaSelectionQueue.shift()!
      entry = availableKana.find(k => k.id === nextId)!
    }
    
    this.kanaLastSeen.set(entry.id, now)
    const currentCount = this.kanaRoundCount.get(entry.id) || 0
    this.kanaRoundCount.set(entry.id, currentCount + 1)
    
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

  handleCommit(value: string){
    if(!value) return
    
    // Don't process input when game is not running (paused or not started)
    if(!this.running) return
    
    // Find matching token
    const match = findTokenMatch(this.tokens, value)
    if (!match) return
    
    const t = this.tokens[match.tokenIndex]
    
    // Remove from array immediately
    this.tokens.splice(match.tokenIndex, 1)
    
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
    this.renderer.showFloatingText(t.x + FLOATING_TEXT_OFFSET_X, t.y + FLOATING_TEXT_OFFSET_Y, `+${points}`, 'points')
    if(this.combo > 1) {
      this.renderer.showFloatingText(t.x + FLOATING_TEXT_OFFSET_X, t.y + FLOATING_TEXT_COMBO_OFFSET_Y, `${this.combo}${COMBO_DISPLAY_SUFFIX}`, 'combo')
    }
    
    // Clear buffer based on match type, then update the visual echo after a short
    // delay so the player can briefly see the characters they entered.
    if(match.matchType === 'romaji' && match.matchedLength) {
      // Consume only the matched portion from buffer
      this.input.buffer = this.input.buffer.slice(match.matchedLength)
    } else {
      // Clear buffer for exact kana match (IME)
      this.input.buffer = ''
    }
    // Snapshot the cleared value; only update the echo if no new input arrived
    // during the delay (fast typists will have already moved onKey forward).
    const displaySnapshot = this.input.buffer
    setTimeout(() => {
      if(this.input.buffer === displaySnapshot) {
        this.input.onKey(displaySnapshot)
      }
    }, INPUT_ECHO_CLEAR_DELAY)
    
    // Instantly spawn a new tile if board is now empty
    if(this.tokens.length === 0) {
      this.spawnToken()
      this.spawnAccumulator = 0 // Reset spawn timer
    }
  }

  async loadKana(setName: KanaSet){
    this.currentKanaSet = setName
    if(setName === KANA_SET_KATAKANA){
      this.kanaSet = kanaKatakana as any
    } else if(setName === KANA_SET_MIXED){
      // Combine both hiragana and katakana
      this.kanaSet = [...(kanaHiragana as any), ...(kanaKatakana as any)]
    } else {
      // default to hiragana
      this.kanaSet = kanaHiragana as any
    }
  }
}
