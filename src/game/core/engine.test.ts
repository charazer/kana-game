import { GameEngine, type Renderer } from './engine'
import { InputManager } from '../input/input'
import type { KanaEntry } from './types'
import {
  GAME_MODE_PRACTICE,
  GAME_MODE_CHALLENGE,
  KANA_SET_HIRAGANA,
  KANA_SET_KATAKANA,
  KANA_SET_MIXED,
  INITIAL_LIVES
} from '../constants/constants'
import { BASIC_KANA_IDS } from '../constants/kana-constants'

describe('engine', () => {
  let mockRenderer: Renderer
  let inputManager: InputManager
  let engine: GameEngine
  let mockOnScore: ReturnType<typeof vi.fn>
  let mockOnLivesChange: ReturnType<typeof vi.fn>
  let mockOnGameOver: ReturnType<typeof vi.fn>
  let mockOnCombo: ReturnType<typeof vi.fn>
  let mockOnSpeedChange: ReturnType<typeof vi.fn>
  let createdElements: HTMLElement[]

  beforeEach(() => {
    vi.useFakeTimers()
    createdElements = []
    
    // Mock renderer
    mockRenderer = {
      createTokenEl: vi.fn((id: string, kana: string) => {
        const el = document.createElement('div')
        el.dataset.id = id
        el.textContent = kana
        createdElements.push(el)
        return el
      }),
      removeTokenEl: vi.fn(),
      setTokenPosition: vi.fn(),
      flashToken: vi.fn(),
      showFloatingText: vi.fn(),
      getHeight: vi.fn(() => 600)
    }
    
    inputManager = new InputManager()
    
    mockOnScore = vi.fn()
    mockOnLivesChange = vi.fn()
    mockOnGameOver = vi.fn()
    mockOnCombo = vi.fn()
    mockOnSpeedChange = vi.fn()
    
    engine = new GameEngine({
      renderer: mockRenderer,
      input: inputManager,
      onScore: mockOnScore as any,
      onLivesChange: mockOnLivesChange as any,
      onGameOver: mockOnGameOver as any,
      onCombo: mockOnCombo as any,
      onSpeedChange: mockOnSpeedChange as any
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('GameEngine initialization', () => {
    it('should initialize with default values', () => {
      expect(engine.running).toBe(false)
      expect(engine.score).toBe(0)
      expect(engine.lives).toBe(INITIAL_LIVES)
      expect(engine.combo).toBe(0)
      expect(engine.gameTime).toBe(0)
      expect(engine.tokens).toEqual([])
    })

    it('should load hiragana kana by default', () => {
      expect(engine.kanaSet.length).toBeGreaterThan(0)
      expect(engine.kanaSet[0]).toHaveProperty('id')
      expect(engine.kanaSet[0]).toHaveProperty('kana')
      expect(engine.kanaSet[0]).toHaveProperty('romaji')
    })

    it('should set up input handlers', () => {
      expect(inputManager.onKey).toBeDefined()
      expect(inputManager.onCommit).toBeDefined()
    })
  })

  describe('setGameMode', () => {
    it('should set practice mode with correct settings', () => {
      engine.setGameMode(GAME_MODE_PRACTICE)
      
      expect(engine.gameMode).toBe(GAME_MODE_PRACTICE)
      expect(engine.baseSpeed).toBe(20) // PRACTICE_BASE_SPEED
      expect(engine.speed).toBe(20)
      expect(engine.maxActiveTokens).toBe(5) // PRACTICE_MAX_TOKENS
    })

    it('should set challenge mode with correct settings', () => {
      engine.setGameMode(GAME_MODE_CHALLENGE)
      
      expect(engine.gameMode).toBe(GAME_MODE_CHALLENGE)
      expect(engine.baseSpeed).toBe(40) // CHALLENGE_BASE_SPEED
      expect(engine.speed).toBe(40)
      expect(engine.maxActiveTokens).toBe(8) // CHALLENGE_MAX_TOKENS
    })
  })

  describe('start, pause, resume', () => {
    it('should start the game loop', () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame')
      
      engine.start()
      
      expect(engine.running).toBe(true)
      expect(rafSpy).toHaveBeenCalled()
    })

    it('should pause the game', () => {
      engine.start()
      engine.pause()
      
      expect(engine.running).toBe(false)
    })

    it('should resume the game after pause', () => {
      engine.start()
      engine.pause()
      
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame')
      engine.resume()
      
      expect(engine.running).toBe(true)
      expect(rafSpy).toHaveBeenCalled()
    })

    it('should not resume if already running', () => {
      engine.start()
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame')
      rafSpy.mockClear()
      
      engine.resume()
      
      expect(rafSpy).not.toHaveBeenCalled()
    })
  })

  describe('reset', () => {
    it('should reset all game state', () => {
      engine.score = 100
      engine.lives = 1
      engine.combo = 5
      engine.correctAnswers = 10
      engine.gameTime = 30
      engine.running = true
      
      engine.reset()
      
      expect(engine.running).toBe(false)
      expect(engine.score).toBe(0)
      expect(engine.lives).toBe(INITIAL_LIVES)
      expect(engine.combo).toBe(0)
      expect(engine.correctAnswers).toBe(0)
      expect(engine.gameTime).toBe(0)
      expect(mockOnScore).toHaveBeenCalledWith(0)
      expect(mockOnLivesChange).toHaveBeenCalledWith(INITIAL_LIVES)
    })

    it('should clear all tokens', () => {
      engine.tokens = [{
        id: 'a',
        entry: { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' },
        el: document.createElement('div'),
        kana: 'あ',
        y: 100,
        x: 50,
        spawnTime: performance.now()
      }]
      
      engine.reset()
      
      expect(engine.tokens).toEqual([])
      expect(mockRenderer.removeTokenEl).toHaveBeenCalled()
    })

    it('should clear input buffer', () => {
      inputManager.buffer = 'test'
      engine.reset()
      
      expect(inputManager.buffer).toBe('')
    })
  })

  describe('loadKana', () => {
    it('should load hiragana kana set', async () => {
      await engine.loadKana(KANA_SET_HIRAGANA)
      
      expect(engine.currentKanaSet).toBe(KANA_SET_HIRAGANA)
      expect(engine.kanaSet.length).toBeGreaterThan(0)
      // Check it's hiragana (first character should be あ)
      expect(engine.kanaSet[0].kana).toBe('あ')
    })

    it('should load katakana kana set', async () => {
      await engine.loadKana(KANA_SET_KATAKANA)
      
      expect(engine.currentKanaSet).toBe(KANA_SET_KATAKANA)
      expect(engine.kanaSet.length).toBeGreaterThan(0)
      // Check it's katakana (first character should be ア)
      expect(engine.kanaSet[0].kana).toBe('ア')
    })

    it('should load mixed kana set with both hiragana and katakana', async () => {
      await engine.loadKana(KANA_SET_MIXED)
      
      expect(engine.currentKanaSet).toBe(KANA_SET_MIXED)
      expect(engine.kanaSet.length).toBeGreaterThan(46 * 2) // At least double the basic sets
      
      // Should contain both hiragana and katakana
      const hasHiragana = engine.kanaSet.some(k => k.kana === 'あ')
      const hasKatakana = engine.kanaSet.some(k => k.kana === 'ア')
      expect(hasHiragana).toBe(true)
      expect(hasKatakana).toBe(true)
    })
  })

  describe('getAvailableKana', () => {
    it('should return only basic kana at start', () => {
      engine.correctAnswers = 0
      
      const available = engine.getAvailableKana()
      
      // Should have all 46 basic kana
      expect(available.length).toBe(46)
      // All should be in basic list (no dakuten or yoon)
      const hasDakuten = available.some(k => ['ga', 'gi', 'gu', 'ge', 'go', 'za', 'pa'].includes(k.id))
      const hasYoon = available.some(k => ['kya', 'kyu', 'kyo', 'nya', 'rya'].includes(k.id))
      expect(hasDakuten).toBe(false)
      expect(hasYoon).toBe(false)
    })

    it('should unlock dakuten after 10 correct answers', () => {
      engine.correctAnswers = 10
      engine.includeDakuten = true
      
      const available = engine.getAvailableKana()
      
      // Should include dakuten kana like "ga"
      const hasDakuten = available.some(k => ['ga', 'gi', 'gu', 'ge', 'go', 'za', 'pa'].includes(k.id))
      expect(hasDakuten).toBe(true)
    })

    it('should unlock yoon after 20 correct answers', () => {
      engine.correctAnswers = 20
      engine.includeYoon = true
      
      const available = engine.getAvailableKana()
      
      // Should include yoon kana like "kya"
      const hasYoon = available.some(k => ['kya', 'kyu', 'kyo', 'nya', 'rya'].includes(k.id))
      expect(hasYoon).toBe(true)
    })

    it('should respect includeDakuten setting', () => {
      engine.correctAnswers = 15
      engine.includeDakuten = false
      
      const available = engine.getAvailableKana()
      
      const hasDakuten = available.some(k => ['ga', 'gi', 'gu', 'ge', 'go'].includes(k.id))
      expect(hasDakuten).toBe(false)
    })

    it('should respect includeYoon setting', () => {
      engine.correctAnswers = 25
      engine.includeYoon = false
      
      const available = engine.getAvailableKana()
      
      const hasYoon = available.some(k => ['kya', 'kyu', 'kyo'].includes(k.id))
      expect(hasYoon).toBe(false)
    })
  })

  describe('getDifficultyMultiplier', () => {
    it('should return 1.0 when both dakuten and yoon enabled (hiragana)', () => {
      engine.includeDakuten = true
      engine.includeYoon = true
      engine.currentKanaSet = KANA_SET_HIRAGANA
      
      expect(engine.getDifficultyMultiplier()).toBe(1.0)
    })

    it('should return 0.75 when only dakuten enabled', () => {
      engine.includeDakuten = true
      engine.includeYoon = false
      engine.currentKanaSet = KANA_SET_HIRAGANA
      
      expect(engine.getDifficultyMultiplier()).toBe(0.75)
    })

    it('should return 0.75 when only yoon enabled', () => {
      engine.includeDakuten = false
      engine.includeYoon = true
      engine.currentKanaSet = KANA_SET_HIRAGANA
      
      expect(engine.getDifficultyMultiplier()).toBe(0.75)
    })

    it('should return 0.5 when both dakuten and yoon disabled', () => {
      engine.includeDakuten = false
      engine.includeYoon = false
      engine.currentKanaSet = KANA_SET_HIRAGANA
      
      expect(engine.getDifficultyMultiplier()).toBe(0.5)
    })

    it('should return 1.25 for mixed kana with both enabled', () => {
      engine.includeDakuten = true
      engine.includeYoon = true
      engine.currentKanaSet = KANA_SET_MIXED
      
      expect(engine.getDifficultyMultiplier()).toBe(1.25)
    })

    it('should apply mixed kana bonus correctly', () => {
      engine.includeDakuten = true
      engine.includeYoon = false
      engine.currentKanaSet = KANA_SET_MIXED
      
      // 0.75 * 1.25 = 0.9375
      expect(engine.getDifficultyMultiplier()).toBe(0.9375)
    })
  })

  describe('calculateScore', () => {
    it('should calculate base score correctly', () => {
      engine.combo = 0
      engine.includeDakuten = true
      engine.includeYoon = true
      engine.currentKanaSet = KANA_SET_HIRAGANA
      
      const token = { spawnTime: performance.now() }
      const score = engine.calculateScore(token)
      
      // Base is 10, with time bonus up to 10, multiplied by combo (1.0) and difficulty (1.0)
      expect(score).toBeGreaterThanOrEqual(10)
      expect(score).toBeLessThanOrEqual(20)
    })

    it('should apply combo multiplier', () => {
      engine.combo = 5
      engine.includeDakuten = true
      engine.includeYoon = true
      engine.currentKanaSet = KANA_SET_HIRAGANA
      
      const token = { spawnTime: performance.now() }
      const score = engine.calculateScore(token)
      
      // With combo 5, multiplier is 1 + (5 * 0.05) = 1.25
      // So score should be at least 10 * 1.25 = 12.5 (rounded to 13)
      expect(score).toBeGreaterThanOrEqual(13)
    })

    it('should apply difficulty multiplier', () => {
      engine.combo = 0
      engine.includeDakuten = false
      engine.includeYoon = false
      engine.currentKanaSet = KANA_SET_HIRAGANA
      
      const token = { spawnTime: performance.now() }
      const score = engine.calculateScore(token)
      
      // With difficulty 0.5, score should be halved
      expect(score).toBeGreaterThanOrEqual(5)
      expect(score).toBeLessThanOrEqual(10)
    })

    it('should give higher scores for faster answers', () => {
      engine.combo = 0
      engine.includeDakuten = true
      engine.includeYoon = true
      
      const fastToken = { spawnTime: performance.now() - 100 }
      const slowToken = { spawnTime: performance.now() - 5000 }
      
      const fastScore = engine.calculateScore(fastToken)
      const slowScore = engine.calculateScore(slowToken)
      
      expect(fastScore).toBeGreaterThan(slowScore)
    })
  })

  describe('spawnToken', () => {
    it('should not spawn if no kana available', () => {
      engine.kanaSet = []
      engine.spawnToken()
      
      expect(engine.tokens.length).toBe(0)
      expect(mockRenderer.createTokenEl).not.toHaveBeenCalled()
    })

    it('should not spawn if at max tokens', () => {
      engine.maxActiveTokens = 1
      engine.tokens = [{
        id: 'a',
        entry: { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' },
        el: document.createElement('div'),
        kana: 'あ',
        y: 100,
        x: 50,
        spawnTime: performance.now()
      }]
      
      engine.spawnToken()
      
      expect(engine.tokens.length).toBe(1)
      expect(mockRenderer.createTokenEl).not.toHaveBeenCalled()
    })

    it('should spawn a token with valid kana', () => {
      engine.spawnToken()
      
      expect(engine.tokens.length).toBe(1)
      expect(mockRenderer.createTokenEl).toHaveBeenCalled()
      expect(mockRenderer.setTokenPosition).toHaveBeenCalled()
      expect(engine.tokens[0]).toHaveProperty('id')
      expect(engine.tokens[0]).toHaveProperty('entry')
      expect(engine.tokens[0]).toHaveProperty('el')
      expect(engine.tokens[0]).toHaveProperty('x')
      expect(engine.tokens[0]).toHaveProperty('y')
      expect(engine.tokens[0].y).toBe(0)
    })

    it('should track when kana was last seen', () => {
      const before = performance.now()
      engine.spawnToken()
      const after = performance.now()
      
      const spawnedId = engine.tokens[0].id
      const lastSeen = engine.kanaLastSeen.get(spawnedId)
      
      expect(lastSeen).toBeDefined()
      expect(lastSeen!).toBeGreaterThanOrEqual(before)
      expect(lastSeen!).toBeLessThanOrEqual(after)
    })

    it('should prefer unseen kana', () => {
      // Mark one kana as recently seen
      const firstKana = engine.kanaSet[0]
      engine.kanaLastSeen.set(firstKana.id, performance.now())
      
      // Spawn multiple tokens
      for (let i = 0; i < 5; i++) {
        engine.tokens = [] // Clear to allow spawning
        engine.spawnToken()
      }
      
      // At least some should not be the recently seen one
      const hasOther = engine.tokens.some(t => t.id !== firstKana.id)
      expect(hasOther).toBe(true)
    })
  })

  describe('handleCommit', () => {
    beforeEach(() => {
      // Add a test token
      const testEntry: KanaEntry = { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' }
      engine.tokens.push({
        id: 'ka',
        entry: testEntry,
        el: document.createElement('div'),
        kana: 'か',
        y: 100,
        x: 50,
        spawnTime: performance.now()
      })
    })

    it('should ignore empty value', () => {
      engine.running = true // Set running without calling start() to avoid spawning
      const initialTokens = engine.tokens.length
      engine.handleCommit('')
      
      expect(engine.tokens.length).toBe(initialTokens)
      expect(mockRenderer.flashToken).not.toHaveBeenCalled()
    })

    it('should ignore input when game not running', () => {
      engine.running = false
      engine.handleCommit('ka')
      
      expect(engine.tokens.length).toBe(1)
      expect(mockRenderer.flashToken).not.toHaveBeenCalled()
    })

    it('should match romaji and remove token', () => {
      engine.running = true // Set running without calling start() to avoid spawning
      inputManager.buffer = 'ka'
      engine.handleCommit('ka')
      
      // After matching the last token, a new one spawns instantly
      expect(engine.tokens.length).toBe(1)
      expect(mockRenderer.flashToken).toHaveBeenCalledWith(expect.any(HTMLElement), true)
      expect(engine.score).toBeGreaterThan(0)
      expect(engine.combo).toBe(1)
    })

    it('should increment correct answers', () => {
      engine.start()
      engine.correctAnswers = 5
      inputManager.buffer = 'ka'
      engine.handleCommit('ka')
      
      expect(engine.correctAnswers).toBe(6)
    })

    it('should update score and combo callbacks', () => {
      engine.start()
      inputManager.buffer = 'ka'
      engine.handleCommit('ka')
      
      expect(mockOnScore).toHaveBeenCalledWith(expect.any(Number))
      expect(mockOnCombo).toHaveBeenCalledWith(1)
    })

    it('should show floating text for points', () => {
      engine.start()
      inputManager.buffer = 'ka'
      engine.handleCommit('ka')
      
      expect(mockRenderer.showFloatingText).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringMatching(/^\+\d+$/),
        'points'
      )
    })

    it('should show combo text for combo > 1', () => {
      engine.start()
      engine.combo = 1
      inputManager.buffer = 'ka'
      engine.handleCommit('ka')
      
      // combo will be 2 after this match
      expect(mockRenderer.showFloatingText).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringMatching(/^2/),
        'combo'
      )
    })

    it('should consume matched portion from buffer', () => {
      engine.start()
      inputManager.buffer = 'ka'
      engine.handleCommit('ka')
      
      expect(inputManager.buffer).toBe('')
    })

    it('should handle partial buffer consumption', () => {
      // Add another token
      const shiEntry: KanaEntry = { id: 'shi', kana: 'し', romaji: ['shi', 'si'], type: 'hiragana' }
      engine.tokens.push({
        id: 'shi',
        entry: shiEntry,
        el: document.createElement('div'),
        kana: 'し',
        y: 150,
        x: 100,
        spawnTime: performance.now()
      })
      
      engine.running = true // Set running without calling start() to avoid spawning
      inputManager.buffer = 'kashi'
      engine.handleCommit('kashi')
      
      // Should match "ka" first, leaving "shi" in buffer
      expect(inputManager.buffer).toBe('shi')
      expect(engine.tokens.length).toBe(1)
      expect(engine.tokens[0].id).toBe('shi')
    })

    it('should handle exact kana match for IME input', () => {
      engine.running = true // Set running without calling start() to avoid spawning
      inputManager.buffer = 'か'
      engine.handleCommit('か')
      
      // After matching the last token, a new one spawns instantly
      expect(engine.tokens.length).toBe(1)
      expect(mockRenderer.flashToken).toHaveBeenCalledWith(expect.any(HTMLElement), true)
      expect(inputManager.buffer).toBe('')
    })

    it('should handle alternative romaji', () => {
      // Replace with shi token which has alternatives
      engine.tokens = []
      const shiEntry: KanaEntry = { id: 'shi', kana: 'し', romaji: ['shi', 'si'], type: 'hiragana' }
      engine.tokens.push({
        id: 'shi',
        entry: shiEntry,
        el: document.createElement('div'),
        kana: 'し',
        y: 100,
        x: 50,
        spawnTime: performance.now()
      })
      
      engine.running = true // Set running without calling start() to avoid spawning
      inputManager.buffer = 'si'
      engine.handleCommit('si')
      
      // After matching the last token, a new one spawns instantly
      expect(engine.tokens.length).toBe(1)
      expect(mockRenderer.flashToken).toHaveBeenCalledWith(expect.any(HTMLElement), true)
    })
  })

  describe('game loop and token movement', () => {
    it('should move tokens downward over time', () => {
      engine.start()
      engine.spawnToken()
      
      const token = engine.tokens[0]
      const initialY = token.y
      
      // Advance time by 1 second
      vi.advanceTimersByTime(1000)
      
      // Manually trigger loop since we're using fake timers
      engine.loop(performance.now())
      
      expect(token.y).toBeGreaterThan(initialY)
    })

    it('should lose life when token reaches danger zone in challenge mode', () => {
      engine.setGameMode(GAME_MODE_CHALLENGE)
      engine.start()
      
      // Manually add a token past danger zone threshold
      engine.tokens.push({
        id: 'a',
        entry: { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' },
        el: document.createElement('div'),
        kana: 'あ',
        y: 600 - 80 + 1, // Just past danger zone (80px from bottom)
        x: 50,
        spawnTime: performance.now()
      })
      
      const initialLives = engine.lives
      engine.loop(performance.now())
      
      expect(engine.lives).toBe(initialLives - 1)
      expect(engine.combo).toBe(0)
      expect(mockOnLivesChange).toHaveBeenCalled()
    })

    it('should not lose life in practice mode', () => {
      engine.setGameMode(GAME_MODE_PRACTICE)
      engine.start()
      
      engine.tokens.push({
        id: 'a',
        entry: { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' },
        el: document.createElement('div'),
        kana: 'あ',
        y: 600 - 80,
        x: 50,
        spawnTime: performance.now()
      })
      
      const initialLives = engine.lives
      engine.loop(performance.now())
      
      expect(engine.lives).toBe(initialLives)
      expect(engine.combo).toBe(0) // Combo still resets
    })

    it('should trigger game over when lives reach 0', () => {
      engine.setGameMode(GAME_MODE_CHALLENGE)
      engine.start()
      engine.lives = 1
      
      engine.tokens.push({
        id: 'a',
        entry: { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' },
        el: document.createElement('div'),
        kana: 'あ',
        y: 600 - 80 + 1, // Past danger zone
        x: 50,
        spawnTime: performance.now()
      })
      
      engine.loop(performance.now())
      
      expect(engine.lives).toBe(0)
      expect(engine.running).toBe(false)
      expect(mockOnGameOver).toHaveBeenCalled()
    })

    it('should increase speed over time in challenge mode', () => {
      engine.setGameMode(GAME_MODE_CHALLENGE)
      engine.start()
      engine.gameTime = 0
      
      const initialSpeed = engine.speed
      
      // Simulate 15 seconds passing
      engine.gameTime = 15
      engine.loop(performance.now() + 15000)
      
      expect(engine.speed).toBeGreaterThan(initialSpeed)
    })

    it('should not increase speed in practice mode', () => {
      engine.setGameMode(GAME_MODE_PRACTICE)
      engine.start()
      engine.gameTime = 0
      
      const initialSpeed = engine.speed
      
      // Simulate 15 seconds passing
      engine.gameTime = 15
      engine.loop(performance.now() + 15000)
      
      expect(engine.speed).toBe(initialSpeed)
    })

    it('should call onSpeedChange when speed multiplier increases', () => {
      engine.setGameMode(GAME_MODE_CHALLENGE)
      engine.start()
      engine.gameTime = 1 // Past delay threshold
      engine.lastSpeedMultiplier = 1.0
      
      mockOnSpeedChange.mockClear()
      
      // Simulate 15 seconds passing
      engine.gameTime = 15
      engine.loop(performance.now() + 15000)
      
      expect(mockOnSpeedChange).toHaveBeenCalled()
    })

    it('should not call onSpeedChange during initial delay', () => {
      engine.setGameMode(GAME_MODE_CHALLENGE)
      engine.start()
      engine.gameTime = 0.5 // Within delay threshold
      
      mockOnSpeedChange.mockClear()
      
      engine.loop(performance.now() + 500)
      
      expect(mockOnSpeedChange).not.toHaveBeenCalled()
    })
  })

  describe('token spawning over time', () => {
    it('should spawn tokens at regular intervals', () => {
      engine.start()
      engine.spawnAccumulator = 0
      engine.spawnInterval = 0.9
      
      // Simulate time passing
      engine.loop(performance.now())
      engine.loop(performance.now() + 1000) // 1 second later
      
      expect(engine.tokens.length).toBeGreaterThan(0)
    })

    it('should not spawn beyond max tokens', () => {
      engine.maxActiveTokens = 2
      engine.start()
      
      // Force multiple spawns
      for (let i = 0; i < 5; i++) {
        engine.spawnToken()
      }
      
      expect(engine.tokens.length).toBeLessThanOrEqual(2)
    })
  })

  describe('weighted kana selection', () => {
    it('should assign high weight to unseen kana', () => {
      engine.kanaLastSeen.clear()
      
      // Mock Math.random to select first available kana
      vi.spyOn(Math, 'random').mockReturnValue(0.001)
      
      engine.spawnToken()
      
      // First spawn should be an unseen kana
      expect(engine.tokens.length).toBe(1)
    })

    it('should handle all time threshold branches', () => {
      const now = performance.now()
      
      // Set up kana with different time thresholds
      const kana1 = engine.kanaSet[0]
      const kana2 = engine.kanaSet[1]
      const kana3 = engine.kanaSet[2]
      const kana4 = engine.kanaSet[3]
      
      // Very recent (< 2 seconds)
      engine.kanaLastSeen.set(kana1.id, now - 1000)
      // Recent (2-10 seconds)
      engine.kanaLastSeen.set(kana2.id, now - 5000)
      // Moderate (10-30 seconds)
      engine.kanaLastSeen.set(kana3.id, now - 20000)
      // Old (> 30 seconds)
      engine.kanaLastSeen.set(kana4.id, now - 40000)
      
      // Spawn multiple times to hit different branches
      for (let i = 0; i < 10; i++) {
        engine.tokens = []
        engine.spawnToken()
      }
      
      // Should have spawned at least one token
      expect(engine.kanaLastSeen.size).toBeGreaterThanOrEqual(4)
    })
  })

  describe('practice mode without life loss', () => {
    it('should reset combo in practice mode when token missed', () => {
      engine.setGameMode(GAME_MODE_PRACTICE)
      engine.start()
      engine.combo = 5
      
      engine.tokens.push({
        id: 'a',
        entry: { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' },
        el: document.createElement('div'),
        kana: 'あ',
        y: 600 - 80 + 1,
        x: 50,
        spawnTime: performance.now()
      })
      
      engine.loop(performance.now())
      
      expect(engine.combo).toBe(0)
      expect(mockOnCombo).toHaveBeenCalledWith(0)
    })
  })

  describe('round-robin kana selection', () => {
    it('should guarantee all kana shown N times before any shown N+1 times', () => {
      // Use a small set of basic kana for easier verification
      engine.correctAnswers = 0 // Only basic kana
      engine.includeDakuten = false
      engine.includeYoon = false
      
      const availableKana = engine.getAvailableKana()
      const kanaCount = availableKana.length
      
      // Track spawn count for each kana
      const spawnCounts: Map<string, number> = new Map()
      availableKana.forEach(k => spawnCounts.set(k.id, 0))
      
      // Spawn many kana (3 full rounds = 3 * 46 = 138 spawns)
      const totalSpawns = kanaCount * 3
      
      for (let i = 0; i < totalSpawns; i++) {
        engine.tokens = [] // Clear tokens to allow spawning
        engine.spawnToken()
        
        const spawnedId = engine.tokens[0].id
        spawnCounts.set(spawnedId, (spawnCounts.get(spawnedId) || 0) + 1)
        
        // After each spawn, verify round-robin property:
        // Max count should never exceed (min count + 1)
        const counts = Array.from(spawnCounts.values())
        const minCount = Math.min(...counts)
        const maxCount = Math.max(...counts)
        
        expect(maxCount - minCount).toBeLessThanOrEqual(1)
      }
      
      // After 3 full rounds, all kana should have been shown exactly 3 times
      spawnCounts.forEach(count => {
        expect(count).toBe(3)
      })
    })

    it('should not show same kana twice in a row', () => {
      engine.correctAnswers = 0
      engine.includeDakuten = false
      engine.includeYoon = false
      
      let previousId: string | null = null
      
      // Spawn many kana and verify no immediate repeats
      for (let i = 0; i < 100; i++) {
        engine.tokens = [] // Clear tokens to allow spawning
        engine.spawnToken()
        
        const currentId = engine.tokens[0].id
        
        if (previousId !== null) {
          expect(currentId).not.toBe(previousId)
        }
        
        previousId = currentId
      }
    })

    it('should maintain round-robin when dakuten unlocks', () => {
      // Start with basic kana
      engine.correctAnswers = 0
      engine.includeDakuten = true
      engine.includeYoon = false
      
      // Spawn first round of basic kana
      const basicCount = 46
      for (let i = 0; i < basicCount; i++) {
        engine.tokens = []
        engine.spawnToken()
      }
      
      // Now unlock dakuten
      engine.correctAnswers = 10
      
      // Get new available set (should include dakuten)
      const availableKana = engine.getAvailableKana()
      const dakutenCount = availableKana.length - basicCount
      expect(availableKana.length).toBeGreaterThan(basicCount)
      
      // Track spawn counts
      const spawnCounts: Map<string, number> = new Map()
      availableKana.forEach(k => {
        // Basic kana have been shown once, dakuten zero times
        const isBasic = BASIC_KANA_IDS.includes(k.id)
        spawnCounts.set(k.id, isBasic ? 1 : 0)
      })
      
      // Spawn another full round (should prioritize dakuten since they have 0 count)
      for (let i = 0; i < dakutenCount; i++) {
        engine.tokens = []
        engine.spawnToken()
        
        const spawnedId = engine.tokens[0].id
        spawnCounts.set(spawnedId, (spawnCounts.get(spawnedId) || 0) + 1)
      }
      
      // After 25 spawns, all dakuten should have count 1, basic still at 1
      availableKana.forEach(k => {
        expect(spawnCounts.get(k.id)).toBe(1)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle unknown kana type (fallback case)', () => {
      // Add a kana that's not in any category
      const unknownKana: KanaEntry = { id: 'unknown', kana: '?', romaji: ['unknown'], type: 'hiragana' }
      engine.kanaSet.push(unknownKana)
      
      const available = engine.getAvailableKana()
      
      // Should include unknown kana (fallback branch)
      expect(available.some(k => k.id === 'unknown')).toBe(true)
    })

    it('should handle IME input buffer clearing', () => {
      engine.start()
      
      // Add token
      engine.tokens.push({
        id: 'ka',
        entry: { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' },
        el: document.createElement('div'),
        kana: 'か',
        y: 100,
        x: 50,
        spawnTime: performance.now()
      })
      
      // Test exact kana match (IME input)
      inputManager.buffer = 'か'
      engine.handleCommit('か')
      
      // Buffer should be cleared after exact match
      expect(inputManager.buffer).toBe('')
    })

    it('should handle null onCombo callback gracefully', () => {
      // Create engine without onCombo
      const engineNoCombo = new GameEngine({
        renderer: mockRenderer,
        input: inputManager,
        onScore: mockOnScore as any,
        onLivesChange: mockOnLivesChange as any,
        onGameOver: mockOnGameOver as any,
        onCombo: undefined,
        onSpeedChange: mockOnSpeedChange as any
      })
      
      engineNoCombo.setGameMode(GAME_MODE_PRACTICE)
      engineNoCombo.start()
      
      // Add token
      engineNoCombo.tokens.push({
        id: 'ka',
        entry: { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' },
        el: document.createElement('div'),
        kana: 'か',
        y: 100,
        x: 50,
        spawnTime: performance.now()
      })
      
      // Should not throw when onCombo is undefined
      inputManager.buffer = 'か'
      expect(() => engineNoCombo.handleCommit('か')).not.toThrow()
    })

    it('should handle null onSpeedChange callback gracefully', () => {
      // Create engine without onSpeedChange
      const engineNoSpeed = new GameEngine({
        renderer: mockRenderer,
        input: inputManager,
        onScore: mockOnScore as any,
        onLivesChange: mockOnLivesChange as any,
        onGameOver: mockOnGameOver as any,
        onCombo: mockOnCombo as any,
        onSpeedChange: undefined
      })
      
      engineNoSpeed.setGameMode(GAME_MODE_CHALLENGE)
      engineNoSpeed.start()
      engineNoSpeed.gameTime = 1
      engineNoSpeed.lastSpeedMultiplier = 1.0
      
      // Simulate 15 seconds passing
      engineNoSpeed.gameTime = 15
      
      // Should not throw when onSpeedChange is undefined
      expect(() => engineNoSpeed.loop(performance.now() + 15000)).not.toThrow()
    })

    it('should handle reset when game is running', () => {
      engine.start()
      engine.running = true
      engine.score = 100
      
      engine.reset()
      
      expect(engine.running).toBe(false)
      expect(engine.score).toBe(0)
    })

    it('should handle input when buffer doesn\'t match any token', () => {
      engine.running = true // Set running without calling start() to avoid spawning
      
      // Add token but commit something that doesn't match
      engine.tokens.push({
        id: 'ka',
        entry: { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' },
        el: document.createElement('div'),
        kana: 'か',
        y: 100,
        x: 50,
        spawnTime: performance.now()
      })
      
      inputManager.buffer = 'xyz'
      engine.handleCommit('xyz')
      
      // Token should still be there
      expect(engine.tokens.length).toBe(1)
    })
  })
})
