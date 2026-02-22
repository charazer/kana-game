import { vi } from 'vitest'
import {
  initializePauseButton,
  initializeEndGameButton,
  initializeStartButton,
  initializeRestartButton,
  initializeKeyboardShortcuts
} from './game-controls'

// ── Mock DOM elements ─────────────────────────────────────────────────────────

const {
  pauseBtn,
  pausedIndicator,
  endGameBtn,
  confirmEndModal,
  confirmEndYesBtn,
  confirmEndNoBtn,
  startBtn,
  startScreenEl,
  restartBtn,
  gameOverEl,
  speedEl,
  musicToggle
} = vi.hoisted(() => {
  const musicToggle = document.createElement('input') as HTMLInputElement
  musicToggle.type = 'checkbox'
  return {
    pauseBtn: document.createElement('button'),
    pausedIndicator: document.createElement('div'),
    endGameBtn: document.createElement('button'),
    confirmEndModal: document.createElement('div'),
    confirmEndYesBtn: document.createElement('button'),
    confirmEndNoBtn: document.createElement('button'),
    startBtn: document.createElement('button'),
    startScreenEl: document.createElement('div'),
    restartBtn: document.createElement('button'),
    gameOverEl: document.createElement('div'),
    speedEl: document.createElement('div'),
    musicToggle
  }
})

vi.mock('./dom-elements', () => ({
  pauseBtn,
  pausedIndicator,
  endGameBtn,
  confirmEndModal,
  confirmEndYesBtn,
  confirmEndNoBtn,
  startBtn,
  startScreenEl,
  restartBtn,
  gameOverEl,
  speedEl,
  musicToggle
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEngine(overrides: Record<string, unknown> = {}) {
  return {
    running: false,
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    start: vi.fn(),
    onGameOver: vi.fn(),
    input: { enabled: true, buffer: '', onKey: vi.fn() },
    ...overrides
  }
}

function makeAudio() {
  return {
    playPause: vi.fn(),
    playResume: vi.fn(),
    playGameStart: vi.fn(),
    setMusicEnabled: vi.fn()
  }
}

function makeControls() {
  return {
    pause: { enable: vi.fn(), disable: vi.fn() },
    endGame: { enable: vi.fn(), disable: vi.fn() },
    settings: { enable: vi.fn(), disable: vi.fn() }
  }
}

function resetElements() {
  pauseBtn.disabled = false
  endGameBtn.disabled = false
  confirmEndModal.classList.add('hidden')
  pausedIndicator.classList.add('hidden')
  startScreenEl.className = ''
  gameOverEl.className = 'hidden'
  speedEl.textContent = ''
  musicToggle.checked = false
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('game-controls', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetElements()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ─── initializePauseButton ────────────────────────────────────────────────

  describe('initializePauseButton', () => {
    it('should disable the pause button initially', () => {
      const engine = makeEngine()
      const audio = makeAudio()

      initializePauseButton(engine as any, audio as any)

      expect(pauseBtn.disabled).toBe(true)
    })

    it('enable() should enable the pause button', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const handle = initializePauseButton(engine as any, audio as any)

      handle.enable()

      expect(pauseBtn.disabled).toBe(false)
    })

    it('enable() should hide the paused indicator', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const handle = initializePauseButton(engine as any, audio as any)
      pausedIndicator.classList.remove('hidden')

      handle.enable()

      expect(pausedIndicator.classList.contains('hidden')).toBe(true)
    })

    it('disable() should disable the pause button', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const handle = initializePauseButton(engine as any, audio as any)
      handle.enable()

      handle.disable()

      expect(pauseBtn.disabled).toBe(true)
    })

    it('should pause engine and play pause audio when pause button is clicked while running', () => {
      const engine = makeEngine({ running: true })
      const audio = makeAudio()
      const handle = initializePauseButton(engine as any, audio as any)
      handle.enable()

      pauseBtn.click()

      expect(engine.pause).toHaveBeenCalledOnce()
      expect(audio.playPause).toHaveBeenCalledOnce()
      expect(pausedIndicator.classList.contains('hidden')).toBe(false)
    })

    it('should resume engine and hide paused indicator when unpausing', () => {
      const engine = makeEngine({ running: true })
      const audio = makeAudio()
      const handle = initializePauseButton(engine as any, audio as any)
      handle.enable()

      pauseBtn.click() // pause
      pauseBtn.click() // resume

      expect(engine.resume).toHaveBeenCalledOnce()
      expect(audio.playResume).toHaveBeenCalledOnce()
      expect(pausedIndicator.classList.contains('hidden')).toBe(true)
    })

    it('should not toggle pause if game has not started', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      initializePauseButton(engine as any, audio as any)
      // NOTE: handle.enable() not called → game not started

      pauseBtn.click()

      expect(engine.pause).not.toHaveBeenCalled()
    })
  })

  // ─── initializeEndGameButton ──────────────────────────────────────────────
  // Use a single shared mutable engine/audio so initializeEndGameButton is only
  // called ONCE (in beforeAll). Re-calling it each test accumulates anonymous
  // document keydown listeners that interfere with keyboard-based assertions.

  describe('initializeEndGameButton', () => {
    const sharedEngine = {
      running: false,
      pause: vi.fn(), resume: vi.fn(), reset: vi.fn(), start: vi.fn(), onGameOver: vi.fn(),
      input: { enabled: true, buffer: '', onKey: vi.fn() }
    }
    const sharedAudio = {
      playPause: vi.fn(), playResume: vi.fn(), playGameStart: vi.fn(), setMusicEnabled: vi.fn()
    }
    let handle: ReturnType<typeof initializeEndGameButton>

    beforeAll(() => {
      handle = initializeEndGameButton(sharedEngine as any, sharedAudio as any)
    })

    beforeEach(() => {
      // Replace mock functions in-place so the closure picks up fresh fns
      sharedEngine.running = false
      sharedEngine.pause = vi.fn()
      sharedEngine.resume = vi.fn()
      sharedEngine.reset = vi.fn()
      sharedEngine.start = vi.fn()
      sharedEngine.onGameOver = vi.fn()
      sharedEngine.input = { enabled: true, buffer: '', onKey: vi.fn() }
      sharedAudio.playPause = vi.fn()
      sharedAudio.playResume = vi.fn()
      // Close any residual open modal so confirmOpen closure flag resets
      confirmEndNoBtn.click()
      // Reset DOM state (resetElements() in outer beforeEach runs first)
      confirmEndModal.classList.add('hidden')
      pausedIndicator.classList.add('hidden')
      endGameBtn.disabled = true
    })

    it('should disable the end-game button initially', () => {
      expect(endGameBtn.disabled).toBe(true)
    })

    it('enable() should enable the end-game button', () => {
      handle.enable()
      expect(endGameBtn.disabled).toBe(false)
    })

    it('disable() should disable the end-game button', () => {
      handle.enable()
      handle.disable()
      expect(endGameBtn.disabled).toBe(true)
    })

    it('should open the confirm modal when end-game button is clicked', () => {
      sharedEngine.running = true
      handle.enable()
      endGameBtn.click()
      expect(confirmEndModal.classList.contains('hidden')).toBe(false)
    })

    it('should pause engine when opening confirm modal while game is running', () => {
      sharedEngine.running = true
      handle.enable()
      endGameBtn.click()
      expect(sharedEngine.pause).toHaveBeenCalledOnce()
      expect(sharedAudio.playPause).toHaveBeenCalledOnce()
    })

    it('should close confirm modal when No button is clicked', () => {
      sharedEngine.running = true
      handle.enable()
      endGameBtn.click()
      confirmEndNoBtn.click()
      expect(confirmEndModal.classList.contains('hidden')).toBe(true)
    })

    it('should resume game when No button is clicked after auto-pause', () => {
      sharedEngine.running = true
      handle.enable()
      endGameBtn.click()
      confirmEndNoBtn.click()
      expect(sharedEngine.resume).toHaveBeenCalledOnce()
      expect(sharedAudio.playResume).toHaveBeenCalledOnce()
    })

    it('should trigger game over when Yes button is clicked', () => {
      sharedEngine.running = true
      handle.enable()
      endGameBtn.click()
      confirmEndYesBtn.click()
      expect(sharedEngine.running).toBe(false)
      expect(sharedEngine.onGameOver).toHaveBeenCalledOnce()
      expect(confirmEndModal.classList.contains('hidden')).toBe(true)
    })

    it('should close confirm modal on Escape key', () => {
      sharedEngine.running = true
      handle.enable()
      endGameBtn.click() // open modal
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }))
      expect(confirmEndModal.classList.contains('hidden')).toBe(true)
    })

    it('should end game on Y key press while confirm modal is open', () => {
      sharedEngine.running = true
      handle.enable()
      endGameBtn.click() // open modal
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', bubbles: true }))
      expect(confirmEndModal.classList.contains('hidden')).toBe(true)
      expect(sharedEngine.onGameOver).toHaveBeenCalled()
    })

    it('should close modal on N key press while confirm modal is open', () => {
      sharedEngine.running = true
      handle.enable()
      endGameBtn.click() // open modal
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }))
      expect(confirmEndModal.classList.contains('hidden')).toBe(true)
    })

    it('should not open confirm modal when end-game button is disabled', () => {
      // button stays disabled (beforeEach sets disabled = true, enable() not called)
      endGameBtn.click()
      expect(confirmEndModal.classList.contains('hidden')).toBe(true)
    })
  })

  // ─── initializeStartButton ────────────────────────────────────────────────

  describe('initializeStartButton', () => {
    it('should start the game when start button is clicked', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const controls = makeControls()
      initializeStartButton(engine as any, audio as any, controls)

      startBtn.click()

      expect(engine.reset).toHaveBeenCalledOnce()
      expect(engine.start).toHaveBeenCalledOnce()
    })

    it('should enable pause and end-game controls when starting', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const controls = makeControls()
      initializeStartButton(engine as any, audio as any, controls)

      startBtn.click()

      expect(controls.pause.enable).toHaveBeenCalledOnce()
      expect(controls.endGame.enable).toHaveBeenCalledOnce()
    })

    it('should disable settings control when starting', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const controls = makeControls()
      initializeStartButton(engine as any, audio as any, controls)

      startBtn.click()

      expect(controls.settings.disable).toHaveBeenCalledOnce()
    })

    it('should reset speed display when starting', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const controls = makeControls()
      initializeStartButton(engine as any, audio as any, controls)

      startBtn.click()

      expect(speedEl.textContent).toBe('1.0x')
    })

    it('should play game start audio', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const controls = makeControls()
      initializeStartButton(engine as any, audio as any, controls)

      startBtn.click()

      expect(audio.playGameStart).toHaveBeenCalledOnce()
    })

    it('should hide start screen via animation when card child is present', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const controls = makeControls()
      initializeStartButton(engine as any, audio as any, controls)

      // Add a card child so hideScreenWithAnimation takes the animated path
      const card = document.createElement('div')
      card.className = 'start-screen-content'
      startScreenEl.appendChild(card)

      startBtn.click()
      // Fire animationend to trigger finish() (done=false → sets done=true, hides screen)
      card.dispatchEvent(new Event('animationend', { bubbles: true }))
      // Advance past the 500ms safety timeout — finish() runs again but done=true → early return
      vi.advanceTimersByTime(600)

      expect(startScreenEl.classList.contains('hidden')).toBe(true)
      startScreenEl.removeChild(card)
    })

    it('should call setMusicEnabled when music toggle is checked on game start', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const controls = makeControls()
      initializeStartButton(engine as any, audio as any, controls)

      musicToggle.checked = true
      startBtn.click()

      expect(audio.setMusicEnabled).toHaveBeenCalledWith(true)
    })
  })

  // ─── initializeRestartButton ──────────────────────────────────────────────

  describe('initializeRestartButton', () => {
    it('should restart the game when restart button is clicked', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const controls = makeControls()
      initializeRestartButton(engine as any, audio as any, controls)

      restartBtn.click()

      expect(engine.reset).toHaveBeenCalledOnce()
      expect(engine.start).toHaveBeenCalledOnce()
    })

    it('should enable pause and end-game controls when restarting', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      const controls = makeControls()
      initializeRestartButton(engine as any, audio as any, controls)

      restartBtn.click()

      expect(controls.pause.enable).toHaveBeenCalledOnce()
      expect(controls.endGame.enable).toHaveBeenCalledOnce()
    })
  })

  // ─── initializeKeyboardShortcuts ──────────────────────────────────────────
  // Use beforeAll so the document keydown listener is only registered once.
  // Multiple registrations via per-test calls cause `toHaveBeenCalledOnce` to
  // fail because stale listeners fire the same spy again.

  describe('initializeKeyboardShortcuts', () => {
    const sharedEngine = {
      running: false,
      pause: vi.fn(), resume: vi.fn(), reset: vi.fn(), start: vi.fn(), onGameOver: vi.fn(),
      input: { enabled: true, buffer: '', onKey: vi.fn() }
    }

    beforeAll(() => {
      initializeKeyboardShortcuts(sharedEngine as any)
    })

    beforeEach(() => {
      sharedEngine.running = false
    })

    it('should click start button on Enter when start screen is visible', () => {
      const startClickSpy = vi.spyOn(startBtn, 'click')
      startScreenEl.classList.remove('hidden')

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }))

      expect(startClickSpy).toHaveBeenCalledOnce()
      startClickSpy.mockRestore()
    })

    it('should click restart button on Enter when game-over screen is visible', () => {
      const restartClickSpy = vi.spyOn(restartBtn, 'click')
      startScreenEl.classList.add('hidden')
      gameOverEl.classList.remove('hidden')

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }))

      expect(restartClickSpy).toHaveBeenCalledOnce()
      restartClickSpy.mockRestore()
    })

    it('should click pause button on Space when pause is not disabled', () => {
      const pauseClickSpy = vi.spyOn(pauseBtn, 'click')
      pauseBtn.disabled = false

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true }))

      expect(pauseClickSpy).toHaveBeenCalledOnce()
      pauseClickSpy.mockRestore()
    })

    it('should not click pause button on Space when pause is disabled', () => {
      const pauseClickSpy = vi.spyOn(pauseBtn, 'click')
      pauseBtn.disabled = true

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true }))

      expect(pauseClickSpy).not.toHaveBeenCalled()
      pauseClickSpy.mockRestore()
    })

    it('should click end-game button on Escape when end-game is not disabled', () => {
      const endClickSpy = vi.spyOn(endGameBtn, 'click')
      endGameBtn.disabled = false
      confirmEndModal.classList.add('hidden')

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }))

      expect(endClickSpy).toHaveBeenCalledOnce()
      endClickSpy.mockRestore()
    })

    it('should not click end-game on Escape when confirm modal is already open', () => {
      const endClickSpy = vi.spyOn(endGameBtn, 'click')
      endGameBtn.disabled = false
      confirmEndModal.classList.remove('hidden')

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }))

      expect(endClickSpy).not.toHaveBeenCalled()
      endClickSpy.mockRestore()
    })
  })
})
