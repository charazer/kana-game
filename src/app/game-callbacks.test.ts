import { vi } from 'vitest'
import { createGameCallbacks, updateLivesDisplay } from './game-callbacks'
import { GAME_MODE_CHALLENGE, GAME_MODE_PRACTICE, INITIAL_LIVES } from '../game/constants/constants'

// ── Shared mock DOM elements ──────────────────────────────────────────────────

function makeStatEl() {
  const parent = document.createElement('div')
  const child = document.createElement('div')
  parent.appendChild(child)
  return child
}

const {
  scoreEl,
  comboEl,
  speedEl,
  livesEl,
  finalScoreEl,
  newHighScoreEl,
  highScoresEndEl,
  gameOverEl
} = vi.hoisted(() => ({
  scoreEl: makeStatEl(),
  comboEl: makeStatEl(),
  speedEl: makeStatEl(),
  livesEl: makeStatEl(),
  finalScoreEl: document.createElement('div'),
  newHighScoreEl: document.createElement('div'),
  highScoresEndEl: document.createElement('div'),
  gameOverEl: document.createElement('div')
}))

vi.mock('./dom-elements', () => ({
  scoreEl,
  comboEl,
  speedEl,
  livesEl,
  finalScoreEl,
  newHighScoreEl,
  highScoresEndEl,
  gameOverEl
}))

vi.mock('../game/storage/storage', () => ({
  addHighScore: vi.fn(),
  isHighScore: vi.fn(() => false)
}))

vi.mock('./ui-helpers', () => ({
  renderHighScores: vi.fn()
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeControls() {
  return {
    pause: { enable: vi.fn(), disable: vi.fn() },
    endGame: { enable: vi.fn(), disable: vi.fn() },
    settings: { enable: vi.fn(), disable: vi.fn() }
  }
}

function makeRenderer() {
  return {
    getHeight: vi.fn(() => 600),
    showFloatingText: vi.fn(),
    createTokenEl: vi.fn(),
    removeTokenEl: vi.fn(),
    setTokenPosition: vi.fn(),
    flashToken: vi.fn()
  }
}

function makeAudio() {
  return {
    playSuccess: vi.fn(),
    playSpeedIncrease: vi.fn(),
    playLifeLost: vi.fn(),
    playGameOver: vi.fn(),
    playPause: vi.fn(),
    playResume: vi.fn()
  }
}

function makeEngine(overrides: Record<string, unknown> = {}) {
  return {
    score: 0,
    gameMode: GAME_MODE_CHALLENGE,
    onGameOver: vi.fn(),
    ...overrides
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('game-callbacks', () => {
  let renderer: ReturnType<typeof makeRenderer>
  let audio: ReturnType<typeof makeAudio>
  let engine: ReturnType<typeof makeEngine>
  let controls: ReturnType<typeof makeControls>

  beforeEach(async () => {
    vi.useFakeTimers()
    renderer = makeRenderer()
    audio = makeAudio()
    engine = makeEngine()
    controls = makeControls()

    // Reset element state
    scoreEl.textContent = ''
    comboEl.textContent = ''
    speedEl.textContent = ''
    livesEl.innerHTML = ''
    finalScoreEl.textContent = ''
    newHighScoreEl.className = 'hidden'
    gameOverEl.className = 'hidden'
    // Reset parent element animation classes to avoid cross-test leakage
    scoreEl.parentElement?.classList.remove('stat-highlight')
    comboEl.parentElement?.classList.remove('stat-highlight')
    speedEl.parentElement?.classList.remove('stat-highlight')
    livesEl.parentElement?.classList.remove('stat-highlight', 'stat-shake')

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // ─── createGameCallbacks ───────────────────────────────────────────────────

  describe('createGameCallbacks', () => {
    describe('onScore', () => {
      it('should update scoreEl text content', () => {
        const { onScore } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onScore(42)

        expect(scoreEl.textContent).toBe('42')
      })

      it('should flash the score stat element', () => {
        const { onScore } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)
        const parent = scoreEl.parentElement!

        onScore(10)

        expect(parent.classList.contains('stat-highlight')).toBe(true)
        vi.runAllTimers()
        expect(parent.classList.contains('stat-highlight')).toBe(false)
      })

      it('should play success audio', () => {
        const { onScore } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onScore(100)

        expect(audio.playSuccess).toHaveBeenCalledOnce()
      })
    })

    describe('onCombo', () => {
      it('should update comboEl text content', () => {
        const { onCombo } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onCombo(3)

        expect(comboEl.textContent).toBe('3x')
      })

      it('should flash combo parent when combo > 0', () => {
        const { onCombo } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)
        const parent = comboEl.parentElement!

        onCombo(2)

        expect(parent.classList.contains('stat-highlight')).toBe(true)
      })

      it('should not flash combo parent when combo is 0', () => {
        const { onCombo } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)
        const parent = comboEl.parentElement!

        onCombo(0)

        expect(parent.classList.contains('stat-highlight')).toBe(false)
      })
    })

    describe('onSpeedChange', () => {
      it('should update speedEl with formatted multiplier', () => {
        const { onSpeedChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onSpeedChange(1.5)

        expect(speedEl.textContent).toBe('1.5x')
      })

      it('should flash the speed stat element', () => {
        const { onSpeedChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)
        const parent = speedEl.parentElement!

        onSpeedChange(2.0)

        expect(parent.classList.contains('stat-highlight')).toBe(true)
      })

      it('should add speed-flash class to game-area when present', () => {
        const gameArea = document.createElement('div')
        gameArea.id = 'game-area'
        document.body.appendChild(gameArea)

        const { onSpeedChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onSpeedChange(2.0)

        expect(gameArea.classList.contains('speed-flash')).toBe(true)
        vi.runAllTimers()
        expect(gameArea.classList.contains('speed-flash')).toBe(false)

        document.body.removeChild(gameArea)
      })

      it('should show floating text via renderer', () => {
        const { onSpeedChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onSpeedChange(2.0)

        expect(renderer.showFloatingText).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.stringContaining('SPEED UP'),
          'speed'
        )
      })

      it('should play speed increase audio', () => {
        const { onSpeedChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onSpeedChange(2.0)

        expect(audio.playSpeedIncrease).toHaveBeenCalledOnce()
      })
    })

    describe('onLivesChange', () => {
      it('should render heart icons for each life', () => {
        const { onLivesChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onLivesChange(INITIAL_LIVES)

        const hearts = livesEl.querySelectorAll('.heart-icon')
        expect(hearts.length).toBe(INITIAL_LIVES)
      })

      it('should clear previous hearts before rendering', () => {
        const { onLivesChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onLivesChange(INITIAL_LIVES)
        onLivesChange(INITIAL_LIVES - 1)

        const hearts = livesEl.querySelectorAll('.heart-icon')
        expect(hearts.length).toBe(INITIAL_LIVES)
      })

      it('should play life-lost audio and shake when lives decrease', () => {
        const { onLivesChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)
        const parent = livesEl.parentElement!

        onLivesChange(2, 3)

        expect(audio.playLifeLost).toHaveBeenCalledOnce()
        expect(parent.classList.contains('stat-shake')).toBe(true)
      })

      it('should not play life-lost audio when lives stay the same', () => {
        const { onLivesChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onLivesChange(3, 3)

        expect(audio.playLifeLost).not.toHaveBeenCalled()
      })

      it('should not shake when previousLives is undefined', () => {
        const { onLivesChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)
        const parent = livesEl.parentElement!

        onLivesChange(3)

        expect(parent.classList.contains('stat-shake')).toBe(false)
        expect(audio.playLifeLost).not.toHaveBeenCalled()
      })
    })

    describe('onGameOver', () => {
      it('should display the final score', () => {
        engine = makeEngine({ score: 250 })
        const { onGameOver } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onGameOver()

        expect(finalScoreEl.textContent).toBe('250')
      })

      it('should play game over audio', () => {
        const { onGameOver } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onGameOver()

        expect(audio.playGameOver).toHaveBeenCalledOnce()
      })

      it('should disable pause and end-game controls', () => {
        const { onGameOver } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onGameOver()

        expect(controls.pause.disable).toHaveBeenCalledOnce()
        expect(controls.endGame.disable).toHaveBeenCalledOnce()
      })

      it('should enable settings control', () => {
        const { onGameOver } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onGameOver()

        expect(controls.settings.enable).toHaveBeenCalledOnce()
      })

      it('should show game-over screen', () => {
        const { onGameOver } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onGameOver()

        expect(gameOverEl.classList.contains('hidden')).toBe(false)
      })

      it('should show new-high-score element and save score when it is a high score', async () => {
        const { isHighScore, addHighScore } = await import('../game/storage/storage')
        vi.mocked(isHighScore).mockReturnValue(true)

        engine = makeEngine({ score: 999, gameMode: GAME_MODE_CHALLENGE })
        const { onGameOver } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)
        newHighScoreEl.classList.add('hidden')

        onGameOver()

        expect(newHighScoreEl.classList.contains('hidden')).toBe(false)
        expect(addHighScore).toHaveBeenCalledWith(999)
      })

      it('should hide new-high-score element when not a high score', async () => {
        const { isHighScore } = await import('../game/storage/storage')
        vi.mocked(isHighScore).mockReturnValue(false)

        engine = makeEngine({ score: 10, gameMode: GAME_MODE_CHALLENGE })
        const { onGameOver } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)
        newHighScoreEl.classList.remove('hidden')

        onGameOver()

        expect(newHighScoreEl.classList.contains('hidden')).toBe(true)
      })

      it('should not check high scores in practice mode', async () => {
        const { isHighScore } = await import('../game/storage/storage')

        engine = makeEngine({ score: 999, gameMode: GAME_MODE_PRACTICE })
        const { onGameOver } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)

        onGameOver()

        expect(isHighScore).not.toHaveBeenCalled()
      })
    })
  })

  // ─── updateLivesDisplay ────────────────────────────────────────────────────

  describe('updateLivesDisplay', () => {
    it('should hide lives display in practice mode', () => {
      const { onLivesChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)
      // Ensure the parent element exists
      onLivesChange(INITIAL_LIVES)

      updateLivesDisplay(GAME_MODE_PRACTICE)

      expect(livesEl.parentElement!.style.display).toBe('none')
    })

    it('should show lives display in challenge mode', () => {
      const { onLivesChange } = createGameCallbacks(renderer as any, audio as any, engine as any, controls)
      onLivesChange(INITIAL_LIVES)

      updateLivesDisplay(GAME_MODE_CHALLENGE)

      expect(livesEl.parentElement!.style.display).toBe('flex')
    })

    it('should do nothing when livesEl has no parent element', () => {
      const parent = livesEl.parentElement!
      parent.removeChild(livesEl)

      // Should not throw — the guard `if (livesDisplay)` returns early
      updateLivesDisplay(GAME_MODE_PRACTICE)

      // Restore so other tests are unaffected
      parent.appendChild(livesEl)
    })
  })
})
