import kanaHiragana from '../../data/kana/hiragana.json'
import kanaKatakana from '../../data/kana/katakana.json'
import type { KanaEntry } from './types'
import { BASIC_KANA_IDS, DAKUTEN_KANA_IDS, YOON_KANA_IDS } from '../constants/kana-constants'
import { findTokenMatch, kanaKey } from './game-helpers'
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
  getWidth: () => number
  getHeight: () => number
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
  kanaLastSeen: Map<string, number> = new Map() // track when each kana was last shown (keyed by kanaKey)
  kanaSelectionQueue: string[] = [] // queue for round-robin selection (keyed by kanaKey)
  kanaRoundCount: Map<string, number> = new Map() // track how many times each kana has been shown (keyed by kanaKey)
  kanaSetFingerprint = '' // fingerprint of available kana set, used to detect set changes
  spawnAccumulator = 0
  spawnInterval = CHALLENGE_SPAWN_INTERVAL // default to challenge mode interval
  baseSpeed = CHALLENGE_BASE_SPEED
  speed = CHALLENGE_BASE_SPEED
  lastSpeedMultiplier = 1.0 // track last speed multiplier to detect changes
  maxActiveTokens = CHALLENGE_MAX_TOKENS
  includeDakuten = true // user setting for including dakuten/handakuten
  includeYoon = true // user setting for including yoon
  currentKanaSet: KanaSet = KANA_SET_HIRAGANA // track current kana set for scoring
  private readonly boundLoop: (now: number) => void

  constructor(opts: {
    renderer: Renderer
    input: InputManager
    onScore?: (s: number) => void
    onLivesChange?: (lives: number, previousLives?: number) => void
    onGameOver?: () => void
    onCombo?: (combo: number) => void
    onSpeedChange?: (multiplier: number) => void
  }) {
    this.renderer = opts.renderer
    this.input = opts.input
    this.tokens = []
    this.onScore = opts.onScore ?? (() => {})
    this.onLivesChange = opts.onLivesChange ?? (() => {})
    this.onGameOver = opts.onGameOver ?? (() => {})
    this.onCombo = opts.onCombo
    this.onSpeedChange = opts.onSpeedChange
    this.boundLoop = this.loop.bind(this)
    this.input.onCommit = (value) => this.handleCommit(value)
    this.loadKana(KANA_SET_HIRAGANA)
  }

  start() {
    this.running = true
    this.input.enabled = true
    this.last = performance.now()
    this.spawnToken()
    requestAnimationFrame(this.boundLoop)
  }

  setGameMode(mode: GameMode) {
    this.gameMode = mode
    if (mode === GAME_MODE_PRACTICE) {
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

  pause() {
    this.running = false
    this.input.enabled = false
    this.input.buffer = ''
    this.input.onKey('')
  }

  resume() {
    if (this.running) return
    this.running = true
    this.input.enabled = true
    this.last = performance.now()
    requestAnimationFrame(this.boundLoop)
  }

  reset() {
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
    this.kanaSetFingerprint = ''
    for (const t of this.tokens) this.renderer.removeTokenEl(t.el)
    this.tokens = []
    this.kanaLastSeen.clear()
    this.spawnAccumulator = 0
    this.clearInput()
    this.onScore(this.score)
    this.onLivesChange(this.lives)
    this.onCombo?.(this.combo)
  }

  private clearInput() {
    this.input.enabled = false
    this.input.buffer = ''
    this.input.onKey('')
  }

  private resetCombo() {
    this.combo = 0
    this.onCombo?.(this.combo)
  }

  loop(now: number) {
    const dt = (now - this.last) / 1000
    this.last = now

    // Speed progression (challenge mode only)
    this.gameTime += dt
    if (this.gameMode === GAME_MODE_CHALLENGE) {
      const intervals = Math.floor(this.gameTime / SPEED_INCREASE_INTERVAL)
      const speedMultiplier = Math.pow(SPEED_BASE_EXPONENT, intervals)
      if (speedMultiplier > this.lastSpeedMultiplier && this.gameTime > SPEED_CHANGE_DELAY) {
        this.onSpeedChange?.(speedMultiplier)
      }
      this.lastSpeedMultiplier = speedMultiplier
      this.speed = this.baseSpeed * speedMultiplier
    }

    // Spawn by timer
    this.spawnAccumulator += dt
    if (this.spawnAccumulator >= this.spawnInterval) {
      this.spawnAccumulator = 0
      this.spawnToken()
    }

    // Move tokens and collect failures
    const failureY = this.renderer.getHeight() - DANGER_ZONE
    const failed: typeof this.tokens = []

    for (const t of this.tokens) {
      t.y += this.speed * dt
      this.renderer.setTokenPosition(t.el, t.x, t.y)
      if (t.y > failureY) failed.push(t)
    }

    // Process failures
    for (const t of failed) {
      const idx = this.tokens.indexOf(t)
      if (idx >= 0) this.tokens.splice(idx, 1)
      this.renderer.flashToken(t.el, false)

      if (this.gameMode === GAME_MODE_CHALLENGE) {
        const previousLives = this.lives
        this.lives--
        this.onLivesChange(this.lives, previousLives)
        this.renderer.showFloatingText(t.x + FLOATING_TEXT_OFFSET_X, t.y + FLOATING_TEXT_OFFSET_Y, '💔 -1', 'life')

        if (this.lives <= 0) {
          this.running = false
          this.clearInput()
          this.onGameOver()
          return
        }
      }

      this.resetCombo()
    }

    if (this.running) requestAnimationFrame(this.boundLoop)
  }

  getAvailableKana() {
    const unlockDakuten = this.correctAnswers >= UNLOCK_DAKUTEN_THRESHOLD
    const unlockYoon = this.correctAnswers >= UNLOCK_YOON_THRESHOLD

    return this.kanaSet.filter(kana => {
      if (BASIC_KANA_IDS.includes(kana.id)) return true
      if (DAKUTEN_KANA_IDS.includes(kana.id)) return unlockDakuten && this.includeDakuten
      if (YOON_KANA_IDS.includes(kana.id)) return unlockYoon && this.includeYoon
      return true
    })
  }

  getDifficultyMultiplier(): number {
    const enabledCount = Number(this.includeDakuten) + Number(this.includeYoon)
    const baseMultiplier = [0.5, 0.75, 1.0][enabledCount]
    const kanaSetMultiplier = this.currentKanaSet === KANA_SET_MIXED ? 1.25 : 1.0
    return baseMultiplier * kanaSetMultiplier
  }

  calculateScore(token: { spawnTime: number }): number {
    const elapsed = (performance.now() - token.spawnTime) / 1000
    const lifetime = (this.renderer.getHeight() - DANGER_ZONE) / this.speed
    const timeBonus = Math.max(0, Math.min(MAX_TIME_BONUS, Math.round((lifetime - elapsed) / lifetime * MAX_TIME_BONUS)))
    const comboMultiplier = 1 + (this.combo * COMBO_MULTIPLIER)
    return Math.round((BASE_POINTS + timeBonus) * comboMultiplier * this.getDifficultyMultiplier())
  }

  spawnToken() {
    if (this.kanaSet.length === 0 || this.tokens.length >= this.maxActiveTokens) return

    const availableKana = this.getAvailableKana()
    if (availableKana.length === 0) return

    const now = performance.now()
    const entry = this.selectNextKana(availableKana)

    this.kanaLastSeen.set(kanaKey(entry), now)
    this.kanaRoundCount.set(kanaKey(entry), (this.kanaRoundCount.get(kanaKey(entry)) ?? 0) + 1)

    const el = this.renderer.createTokenEl(entry.id, entry.kana)
    const width = this.renderer.getWidth()
    // Scale token width and min distance for narrow viewports to prevent overlap
    const effectiveTokenWidth = Math.min(TOKEN_WIDTH, Math.floor(width * 0.15))
    const effectiveMinDistance = Math.min(MIN_TOKEN_DISTANCE, Math.floor(width * 0.2))
    const safeWidth = width - (SPAWN_MARGIN * 2) - effectiveTokenWidth
    let x = SPAWN_MARGIN + Math.floor(Math.random() * Math.max(0, safeWidth))

    // Avoid overlap with existing tokens
    for (let attempts = 0; attempts < MAX_SPAWN_ATTEMPTS; attempts++) {
      const overlapping = this.tokens.some(t =>
        Math.abs(t.x - x) < effectiveMinDistance && Math.abs(t.y) < VERTICAL_OVERLAP_THRESHOLD
      )
      if (!overlapping) break
      x = SPAWN_MARGIN + Math.floor(Math.random() * Math.max(0, safeWidth))
    }

    this.renderer.setTokenPosition(el, x, 0)
    this.tokens.push({ id: entry.id, entry, el, kana: entry.kana, y: 0, x, spawnTime: performance.now() })
  }

  /** Round-robin kana selection with unseen-first priority */
  private selectNextKana(availableKana: KanaEntry[]): KanaEntry {
    // Always pick unseen kana first
    const unseen = availableKana.filter(k => !this.kanaLastSeen.has(kanaKey(k)))
    if (unseen.length > 0) {
      return unseen[Math.floor(Math.random() * unseen.length)]
    }

    // All seen — use round-robin queue for even distribution
    const fingerprint = availableKana.map(k => kanaKey(k)).sort().join(',')

    if (this.kanaSelectionQueue.length === 0 || this.kanaSetFingerprint !== fingerprint) {
      this.kanaSetFingerprint = fingerprint

      // Build queue from kana with minimum round count
      const minRound = Math.min(...availableKana.map(k => this.kanaRoundCount.get(kanaKey(k)) ?? 0))
      const eligible = availableKana
        .filter(k => (this.kanaRoundCount.get(kanaKey(k)) ?? 0) === minRound)
        .map(k => kanaKey(k))

      // Fisher-Yates shuffle
      for (let i = eligible.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[eligible[i], eligible[j]] = [eligible[j], eligible[i]]
      }

      // Prevent consecutive repeat
      if (eligible.length > 1) {
        const entries = [...this.kanaLastSeen.entries()]
        if (entries.length > 0) {
          const mostRecent = entries.reduce((a, b) => a[1] > b[1] ? a : b)[0]
          if (eligible[0] === mostRecent) {
            const swapIdx = 1 + Math.floor(Math.random() * (eligible.length - 1))
            ;[eligible[0], eligible[swapIdx]] = [eligible[swapIdx], eligible[0]]
          }
        }
      }

      this.kanaSelectionQueue = eligible
    }

    const nextKey = this.kanaSelectionQueue.shift()!
    return availableKana.find(k => kanaKey(k) === nextKey)!
  }

  handleCommit(value: string) {
    if (!value || !this.running) return

    const match = findTokenMatch(this.tokens, value)
    if (!match) return

    const t = this.tokens[match.tokenIndex]
    this.tokens.splice(match.tokenIndex, 1)
    this.renderer.flashToken(t.el, true)
    this.correctAnswers++

    const points = this.calculateScore(t)
    this.combo++
    this.score += points
    this.onScore(this.score)
    this.onCombo?.(this.combo)

    // Floating UI feedback
    this.renderer.showFloatingText(t.x + FLOATING_TEXT_OFFSET_X, t.y + FLOATING_TEXT_OFFSET_Y, `+${points}`, 'points')
    if (this.combo > 1) {
      this.renderer.showFloatingText(t.x + FLOATING_TEXT_OFFSET_X, t.y + FLOATING_TEXT_COMBO_OFFSET_Y, `${this.combo}x`, 'combo')
    }

    // Consume matched portion from buffer
    this.input.buffer = (match.matchType === 'romaji' && match.matchedLength)
      ? this.input.buffer.slice(match.matchedLength)
      : ''

    // Delayed echo update (skip if player typed ahead)
    const snapshot = this.input.buffer
    setTimeout(() => {
      if (this.input.buffer === snapshot) this.input.onKey(snapshot)
    }, INPUT_ECHO_CLEAR_DELAY)

    // Instantly spawn if board is empty
    if (this.tokens.length === 0) {
      this.spawnToken()
      this.spawnAccumulator = 0
    }
  }

  loadKana(setName: KanaSet) {
    this.currentKanaSet = setName
    if (setName === KANA_SET_KATAKANA) {
      this.kanaSet = kanaKatakana as KanaEntry[]
    } else if (setName === KANA_SET_MIXED) {
      this.kanaSet = [...(kanaHiragana as KanaEntry[]), ...(kanaKatakana as KanaEntry[])]
    } else {
      this.kanaSet = kanaHiragana as KanaEntry[]
    }
  }
}
